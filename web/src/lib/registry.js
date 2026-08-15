/**
 * Registry helpers: load the combined index and expose category metadata.
 */

export const CATEGORIES = [
  { id: 'skills', label: 'Skills', icon: '🎓', blurb: 'Agent working practices, planning, and guidance.' },
  { id: 'tools', label: 'Tools', icon: '🛠️', blurb: 'Extra capabilities and tool plugins.' },
  { id: 'web', label: 'Web', icon: '🌐', blurb: 'Web UI and browser-facing plugins.' },
  { id: 'infrastructure', label: 'Infrastructure', icon: '🧱', blurb: 'Runtime, sandbox, and host plumbing.' },
  { id: 'integration', label: 'Integration', icon: '🔌', blurb: 'Bridges to other agents and systems.' },
  { id: 'workflow', label: 'Workflow', icon: '🔁', blurb: 'Automation and multi-step flows.' },
  { id: 'experimental', label: 'Experimental', icon: '🧪', blurb: 'Early-stage or pre-production plugins.' },
  { id: 'other', label: 'Other', icon: '📦', blurb: 'Everything else.' },
]

export function categoryMeta(id) {
  return CATEGORIES.find(c => c.id === id) || { id, label: id, icon: '📦', blurb: '' }
}

export const INSTALL_TARGET_LABELS = {
  npm: 'npm package',
  git: 'Git repository',
  local: 'Local path',
}

/**
 * Load the registry index. If a gzip companion exists and the browser supports
 * it, prefer the precompressed payload; otherwise fetch the plain JSON.
 * @returns {Promise<{generatedAt: string, count: number, plugins: Array}>}
 */
export async function loadRegistry() {
  const plain = await fetch('./index.json')
  const data = await plain.json()
  return data
}

export function installedCommand(plugin, profileName = 'web') {
  return (plugin.install?.command || '').replace('{profile}', profileName)
}

export function installLabel(plugin) {
  const t = plugin.install?.target
  return INSTALL_TARGET_LABELS[t] || t || 'unknown'
}

export function searchPlugins(plugins, query) {
  const q = query.trim().toLowerCase()
  if (!q) return plugins
  return plugins.filter(p => {
    const haystack = [
      p.name,
      p.description,
      p.id,
      ...(p.tags || []),
      ...(p.maintainers || []),
      p.category,
      p.author?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}
