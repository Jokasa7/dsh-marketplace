import React, { useState } from 'react'
import { categoryMeta, installedCommand, installLabel } from '../lib/registry.js'

function PluginDetail({ plugin, onClose }) {
  const [profile, setProfile] = useState('web')
  const [copied, setCopied] = useState(false)
  const cat = categoryMeta(plugin.category)
  const install = plugin.install || {}
  const command = installedCommand(plugin, profile)

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
          {plugin.verified && <span className="verified-badge">✓ Verified</span>}
          {plugin.deprecated && <span className="deprecated-badge">Deprecated</span>}
        </div>

        <h2>{plugin.name} <span className="muted-version">v{plugin.version}</span></h2>

        <p className="modal-desc">{plugin.description}</p>

        <dl className="meta-grid">
          <Meta label="Author" value={plugin.author?.name || 'unknown'} />
          <Meta label="License" value={plugin.license || '—'} />
          <Meta label="Category" value={cat.label} />
          <Meta label="Install type" value={installLabel(plugin)} />
          {plugin.compatibility?.dsh && <Meta label="dsh" value={plugin.compatibility.dsh} />}
        </dl>

        <div className="install-block">
          <div className="install-head">
            <span>Install</span>
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
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="command-hint">
            {install.target === 'npm' && 'Installs the npm package into your selected profile.'}
            {install.target === 'git' && 'Clones and installs the Git-hosted plugin. Its `prepare` build script runs on your machine — if pnpm prompts for an allow-build, copy the printed key into the profile\u2019s pnpm-workspace.yaml and re-run. Prefer plugins that pin a commit sha.'}
            {install.target === 'local' && 'Adds a local file: plugin path.'}
          </p>
        </div>

        {plugin.tags?.length > 0 && (
          <div className="modal-tags">
            {plugin.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        <div className="modal-links">
          {plugin.repository && (
            <a href={plugin.repository} target="_blank" rel="noreferrer">Source ↗</a>
          )}
          {plugin.docs && (
            <a href={plugin.docs} target="_blank" rel="noreferrer">Docs ↗</a>
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
