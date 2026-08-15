import React, { useState } from 'react'
import {
  categoryMeta, installedCommand, installLabel, inferCategory,
  pluginDescription, pluginName,
} from '../lib/registry.js'

function PluginDetail({ plugin, onClose }) {
  const [profile, setProfile] = useState('web')
  const [copied, setCopied] = useState(false)
  const cat = categoryMeta(plugin.category || inferCategory(plugin.tags))
  const install = plugin.install || {}
  const command = installedCommand(plugin, profile)
  const descZh = plugin.descriptionZh
  const descRaw = plugin.description

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboards may be unavailable in some contexts; ignore.
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal-head">
          <span className="cat-badge">{cat.icon} {cat.label}</span>
          {plugin.verified && <span className="verified-badge">✓ 已验证</span>}
          {plugin.source === 'github' && <span className="gh-badge">GitHub</span>}
          {plugin.deprecated && <span className="deprecated-badge">已弃用</span>}
        </div>

        <h2>{pluginName(plugin)} {plugin.version && <span className="muted-version">v{plugin.version}</span>}</h2>

        <p className="modal-desc">{pluginDescription(plugin)}</p>
        {descZh && descRaw && descZh !== descRaw && (
          <p className="modal-desc-en">{descRaw}</p>
        )}

        <dl className="meta-grid">
          <Meta label="作者" value={plugin.author?.name || plugin.fullName?.split('/')[0] || 'unknown'} />
          <Meta label="许可" value={plugin.license || '—'} />
          <Meta label="分类" value={cat.label} />
          <Meta label="安装方式" value={installLabel(plugin)} />
          {plugin.language && <Meta label="语言" value={plugin.language} />}
          {plugin.stars != null && <Meta label="Stars" value={plugin.stars} />}
        </dl>

        <div className="install-block">
          <div className="install-head">
            <span>安装</span>
            <span className="profile-picker">
              profile
              <select value={profile} onChange={e => setProfile(e.target.value)}>
                <option value="web">web</option>
                <option value="headless">headless</option>
                <option value="custom">custom</option>
              </select>
            </span>
          </div>
          <div className="command-row">
            <code className="command">{command}</code>
            <button className="copy-btn" onClick={copy}>
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
          <p className="command-hint">
            {install.target === 'npm' && '将 npm 包安装到所选 profile。'}
            {install.target === 'git' && '克隆并安装 Git 插件，其 prepare 构建脚本会在你机器上执行 —— 若 pnpm 提示 allow-build，把打印的 key 复制到 profile 的 pnpm-workspace.yaml 后重跑。建议固定 commit。'}
            {install.target === 'local' && '添加本地 file: 插件路径。'}
          </p>
        </div>

        {plugin.tags?.length > 0 && (
          <div className="modal-tags">
            {plugin.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        <div className="modal-links">
          {plugin.repository && (
            <a href={plugin.repository} target="_blank" rel="noreferrer">源码 ↗</a>
          )}
          {plugin.homepage && plugin.homepage !== plugin.repository && (
            <a href={plugin.homepage} target="_blank" rel="noreferrer">主页 ↗</a>
          )}
          {plugin.docs && (
            <a href={plugin.docs} target="_blank" rel="noreferrer">文档 ↗</a>
          )}
          {install.spec && <span className="spec">spec: <code>{install.spec}</code></span>}
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div className="meta-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export default PluginDetail
