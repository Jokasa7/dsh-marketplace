import React, { useEffect, useMemo, useState } from 'react'
import {
  CATEGORIES, categoryMeta, loadRegistry, searchPlugins, installedCommand,
  installLabel, collectTags, inferCategory, pluginDescription, pluginName,
} from './lib/registry.js'
import PluginDetail from './components/PluginDetail.jsx'

function App() {
  const [state, setState] = useState({ status: 'loading', registry: null, error: '' })
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState(null)
  const [showAllTags, setShowAllTags] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadRegistry()
      .then(registry => setState({ status: 'ready', registry, error: '' }))
      .catch(err => setState({ status: 'error', registry: null, error: String(err) }))
  }, [])

  const plugins = useMemo(() => state.registry?.plugins || [], [state.registry])

  const tags = useMemo(() => collectTags(plugins, 60), [plugins])
  const visibleTags = showAllTags ? tags : tags.slice(0, 18)

  const catOf = p => p.category || inferCategory(p.tags)

  const filtered = useMemo(() => {
    let list = searchPlugins(plugins, query)
    if (activeCategory !== 'all') {
      list = list.filter(p => catOf(p) === activeCategory)
    }
    if (activeTag) {
      list = list.filter(p => (p.tags || []).some(t => String(t).toLowerCase() === activeTag))
    }
    return list
  }, [plugins, query, activeCategory, activeTag])

  if (state.status === 'loading') {
    return <div className="app"><div className="loading">加载插件市场…</div></div>
  }

  if (state.status === 'error') {
    return (
      <div className="app">
        <div className="error-panel">
          <h1>无法加载插件市场</h1>
          <p>{state.error}</p>
          <p>
            市场读取 <code>index.json</code> 和 <code>github-plugins.json</code>。运行{' '}
            <code>npm run build</code> 生成它们，或打开已部署的副本。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <Logo />
          <div className="hero-text">
            <h1>DSH 插件市场</h1>
            <p className="subtitle">
              DeepSeek Harness 社区插件市场 —— 直接同步{' '}
              <a href="https://github.com/topics/dsh-plugin" target="_blank" rel="noreferrer">GitHub dsh-plugin</a>{' '}
              主题下的全部插件，支持标签分类、搜索与一键安装。
            </p>
          </div>
          <div className="hero-stats">
            <span><strong>{plugins.length}</strong> 个插件</span>
            <span><strong>{plugins.filter(p => p.verified).length}</strong> 已验证</span>
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <h3>分类</h3>
          <button
            className={activeCategory === 'all' && !activeTag ? 'chip active' : 'chip'}
            onClick={() => { setActiveCategory('all'); setActiveTag(null) }}
          >
            <span className="chip-icon">✨</span> 全部
            <span className="chip-count">{plugins.length}</span>
          </button>
          {CATEGORIES.map(cat => {
            const count = plugins.filter(p => catOf(p) === cat.id).length
            return (
              <button
                key={cat.id}
                className={activeCategory === cat.id && !activeTag ? 'chip active' : 'chip'}
                onClick={() => { setActiveCategory(cat.id); setActiveTag(null) }}
                title={cat.blurb}
              >
                <span className="chip-icon">{cat.icon}</span> {cat.label}
                <span className="chip-count">{count}</span>
              </button>
            )
          })}

          {tags.length > 0 && (
            <>
              <h3 style={{ marginTop: 18 }}>标签</h3>
              <div className="tag-cloud">
                {visibleTags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    className={activeTag === tag ? 'tag-chip active' : 'tag-chip'}
                    onClick={() => { setActiveTag(activeTag === tag ? null : tag); setActiveCategory('all') }}
                  >
                    {tag} <span className="tag-chip-count">{count}</span>
                  </button>
                ))}
              </div>
              {tags.length > 18 && (
                <button className="more-tags" onClick={() => setShowAllTags(v => !v)}>
                  {showAllTags ? '收起标签 ↑' : `显示全部 ${tags.length} 个标签 ↓`}
                </button>
              )}
            </>
          )}
        </aside>

        <main className="content">
          <div className="toolbar">
            <input
              type="search"
              className="search"
              placeholder="搜索插件、标签、作者或描述…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <span className="filter-label">
              {activeTag ? `#${activeTag}` : activeCategory === 'all' ? '全部插件' : categoryMeta(activeCategory).label}
              {' '}· {filtered.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">没有匹配的插件，请清除搜索或筛选条件。</div>
          ) : (
            <ul className="card-grid">
              {filtered.map(p => (
                <PluginCard key={p.repository || p.id} plugin={p} onOpen={() => setSelected(p)} />
              ))}
            </ul>
          )}
        </main>
      </div>

      {selected && <PluginDetail plugin={selected} onClose={() => setSelected(null)} />}

      <footer className="footer">
        <p>
          数据同步自 <a href="https://github.com/topics/dsh-plugin" target="_blank" rel="noreferrer">GitHub dsh-plugin topic</a>。
          为你的插件仓库添加 <code>dsh-plugin</code> 主题即可被收录。安装会执行第三方代码，请先审阅。
        </p>
      </footer>
    </div>
  )
}

function Logo() {
  return (
    <svg className="logo" width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
      <rect x="4" y="8" width="44" height="36" rx="8" fill="var(--accent)" />
      <rect x="10" y="15" width="8" height="6" rx="2" fill="#fff" opacity="0.95" />
      <rect x="10" y="25" width="8" height="6" rx="2" fill="#fff" opacity="0.75" />
      <rect x="10" y="35" width="8" height="6" rx="2" fill="#fff" opacity="0.55" />
      <rect x="24" y="15" width="18" height="6" rx="2" fill="#fff" opacity="0.95" />
      <rect x="24" y="25" width="18" height="6" rx="2" fill="#fff" opacity="0.75" />
      <rect x="24" y="35" width="18" height="6" rx="2" fill="#fff" opacity="0.55" />
      <circle cx="44" cy="44" r="6" fill="var(--accent-2)" stroke="#fff" strokeWidth="2" />
      <path d="M41.5 44h5 M44 41.5v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PluginCard({ plugin, onOpen }) {
  const cat = categoryMeta(plugin.category || inferCategory(plugin.tags))
  return (
    <li className="card" onClick={onOpen} role="button" tabIndex={0} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpen()}>
      <div className="card-top">
        <span className="cat-badge">{cat.icon} {cat.label}</span>
        {plugin.verified && <span className="verified-badge" title="已人工验证">✓ 已验证</span>}
        {plugin.source === 'github' && <span className="gh-badge" title="来自 GitHub dsh-plugin">GitHub</span>}
      </div>
      <h3 className="card-title">{pluginName(plugin)}</h3>
      <p className="card-desc">{pluginDescription(plugin)}</p>
      <div className="card-tags">
        {(plugin.tags || []).slice(0, 5).map(t => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <div className="card-foot">
        <span className="stars" title="社区 star 数">★ {plugin.stars ?? 0}</span>
        {plugin.language && <span className="lang">{plugin.language}</span>}
        <span className="install-kind">{installLabel(plugin)}</span>
      </div>
    </li>
  )
}

export default App
