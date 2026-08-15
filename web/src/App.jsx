import React, { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, categoryMeta, loadRegistry, searchPlugins, installedCommand, installLabel } from './lib/registry.js'
import PluginDetail from './components/PluginDetail.jsx'

function App() {
  const [state, setState] = useState({ status: 'loading', registry: null, error: '' })
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadRegistry()
      .then(registry => setState({ status: 'ready', registry, error: '' }))
      .catch(err => setState({ status: 'error', registry: null, error: String(err) }))
  }, [])

  const plugins = useMemo(() => state.registry?.plugins || [], [state.registry])

  const filtered = useMemo(() => {
    let list = searchPlugins(plugins, query)
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory)
    }
    return list
  }, [plugins, query, activeCategory])

  if (state.status === 'loading') {
    return <div className="app"><div className="loading">Loading registry…</div></div>
  }

  if (state.status === 'error') {
    return (
      <div className="app">
        <div className="error-panel">
          <h1>Could not load the registry</h1>
          <p>{state.error}</p>
          <p>
            The marketplace reads <code>index.json</code> from its public directory. Run{' '}
            <code>npm run build</code> to generate it, or open this page in a deployed copy.
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
            <h1>DSH Marketplace</h1>
            <p className="subtitle">
              An open-source plugin marketplace for{' '}
              <a href="https://github.com/deepseek-harness" target="_blank" rel="noreferrer">DeepSeek Harness</a>.
              Browse, search, and install community plugins with one command.
            </p>
          </div>
          <div className="hero-stats">
            <span><strong>{plugins.length}</strong> plugins</span>
            <span><strong>{plugins.filter(p => p.verified).length}</strong> verified</span>
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <h3>Categories</h3>
          <button
            className={activeCategory === 'all' ? 'chip active' : 'chip'}
            onClick={() => setActiveCategory('all')}
          >
            <span className="chip-icon">✨</span> All
          </button>
          {CATEGORIES.map(cat => {
            const count = plugins.filter(p => p.category === cat.id).length
            return (
              <button
                key={cat.id}
                className={activeCategory === cat.id ? 'chip active' : 'chip'}
                onClick={() => setActiveCategory(cat.id)}
                title={cat.blurb}
              >
                <span className="chip-icon">{cat.icon}</span> {cat.label}
                <span className="chip-count">{count}</span>
              </button>
            )
          })}
        </aside>

        <main className="content">
          <div className="toolbar">
            <input
              type="search"
              className="search"
              placeholder="Search plugins, tags, or maintainers…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <span className="filter-label">
              {activeCategory === 'all' ? 'All plugins' : categoryMeta(activeCategory).label}
              {' '}· {filtered.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">No plugins match your filters. Try clearing the search or category.</div>
          ) : (
            <ul className="card-grid">
              {filtered.map(p => (
                <PluginCard key={p.id} plugin={p} onOpen={() => setSelected(p)} />
              ))}
            </ul>
          )}
        </main>
      </div>

      {selected && <PluginDetail plugin={selected} onClose={() => setSelected(null)} />}

      <footer className="footer">
        <p>
          Built on the <a href="https://github.com/cordiverse/cordis" target="_blank" rel="noreferrer">everything-is-a-plugin</a> model.
          Add your plugin — see <code>CONTRIBUTING.md</code>.
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
  const cat = categoryMeta(plugin.category)
  return (
    <li className="card" onClick={onOpen} role="button" tabIndex={0} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpen()}>
      <div className="card-top">
        <span className="cat-badge">{cat.icon} {cat.label}</span>
        {plugin.verified && <span className="verified-badge" title="Maintainer-verified">✓ Verified</span>}
        {plugin.deprecated && <span className="deprecated-badge">Deprecated</span>}
      </div>
      <h3 className="card-title">{plugin.name}</h3>
      <p className="card-desc">{plugin.description}</p>
      <div className="card-tags">
        {(plugin.tags || []).slice(0, 4).map(t => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <div className="card-foot">
        <span className="stars" title="Community stars">★ {plugin.stars ?? 0}</span>
        <span className="install-kind">{installLabel(plugin)}</span>
        <span className="version">v{plugin.version}</span>
      </div>
    </li>
  )
}

export default App
