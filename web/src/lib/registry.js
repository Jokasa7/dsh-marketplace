/**
 * Registry helpers: load the combined catalog (local curated registry + GitHub
 * dsh-plugin topic snapshot), expose category metadata, tag aggregation, and
 * Chinese-description helpers.
 */

export const CATEGORIES = [
  { id: 'skills', label: 'Skills', icon: '🎓', blurb: 'Agent 工作实践、规划与指导。' },
  { id: 'tools', label: 'Tools', icon: '🛠️', blurb: '额外能力与工具插件。' },
  { id: 'web', label: 'Web', icon: '🌐', blurb: 'Web UI 与浏览器相关插件。' },
  { id: 'infrastructure', label: 'Infrastructure', icon: '🧱', blurb: '运行时、沙箱与宿主基础设施。' },
  { id: 'integration', label: 'Integration', icon: '🔌', blurb: '与其他 Agent/系统的桥接。' },
  { id: 'workflow', label: 'Workflow', icon: '🔁', blurb: '自动化与多步流程。' },
  { id: 'experimental', label: 'Experimental', icon: '🧪', blurb: '早期或预发布插件。' },
  { id: 'other', label: 'Other', icon: '📦', blurb: '其他。' },
]

export function categoryMeta(id) {
  return CATEGORIES.find(c => c.id === id) || { id, label: id, icon: '📦', blurb: '' }
}

export const INSTALL_TARGET_LABELS = {
  npm: 'npm 包',
  git: 'Git 仓库',
  local: '本地路径',
}

/** Normalize a repository URL to `owner/repo` for dedup across sources. */
function repoKey(repository) {
  if (!repository) return ''
  const m = String(repository).match(/github\.com\/([^/]+\/[^/#?]+)/i)
  if (m) return m[1].replace(/\/$/, '').toLowerCase()
  return String(repository).toLowerCase()
}

/**
 * Load the merged catalog: the local curated registry (index.json) overrides
 * the GitHub topic snapshot (github-plugins.json) on repo match, so curated
 * entries keep their Chinese descriptions and verified flags while every
 * dsh-plugin GitHub repo is still listed.
 */
export async function loadRegistry() {
  const [local, github] = await Promise.all([
    fetch('./index.json').then(r => (r.ok ? r.json() : null)).catch(() => null),
    fetch('./github-plugins.json').then(r => (r.ok ? r.json() : null)).catch(() => null),
  ])

  const byRepo = new Map()
  const ordered = []

  // Base: GitHub topic snapshot (everything tagged dsh-plugin).
  for (const p of github?.plugins ?? []) {
    const key = repoKey(p.repository) || repoKey(p.install?.spec) || p.id
    byRepo.set(key, p)
    ordered.push(p)
  }

  // Overlay: curated local entries (Chinese descriptions, verified flags).
  for (const p of local?.plugins ?? []) {
    const key = repoKey(p.repository) || repoKey(p.install?.spec) || p.id
    if (byRepo.has(key)) {
      const idx = ordered.findIndex(o => (repoKey(o.repository) || o.id) === key)
      if (idx >= 0) ordered[idx] = { ...ordered[idx], ...p, tags: p.tags || ordered[idx].tags }
      byRepo.set(key, ordered[idx])
    } else {
      byRepo.set(key, p)
      ordered.push(p)
    }
  }

  return {
    generatedAt: local?.generatedAt || github?.generatedAt || new Date().toISOString(),
    count: ordered.length,
    plugins: ordered,
  }
}

export function installedCommand(plugin, profileName = 'web') {
  return (plugin.install?.command || '').replace('{profile}', profileName)
}

export function installLabel(plugin) {
  const t = plugin.install?.target
  return INSTALL_TARGET_LABELS[t] || t || 'unknown'
}

/** Chinese-first description: prefer curated `descriptionZh`, else the raw text. */
export function pluginDescription(plugin) {
  return plugin.descriptionZh || plugin.description || ''
}

export function pluginName(plugin) {
  return plugin.name || plugin.fullName || plugin.id
}

export function searchPlugins(plugins, query) {
  const q = query.trim().toLowerCase()
  if (!q) return plugins
  return plugins.filter(p => {
    const haystack = [
      p.name,
      p.fullName,
      p.description,
      p.descriptionZh,
      p.id,
      ...(p.tags || []),
      ...(p.maintainers || []),
      p.category,
      p.language,
      p.author?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

/**
 * Aggregate tags across the catalog for the filter UI. Returns
 * `[{ tag, count }]` sorted by count desc, with the `dsh-plugin` marker tag and
 * noise (bare `dsh`, `deepseek`) dropped.
 */
export function collectTags(plugins, limit = 60) {
  const counts = new Map()
  const NOISE = new Set(['dsh-plugin', 'dsh', 'deepseek', 'deepseek-harness', 'harness'])
  for (const p of plugins) {
    for (const t of p.tags || []) {
      const key = String(t).toLowerCase()
      if (NOISE.has(key)) continue
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/** Coarse category guess for GitHub-only repos, from their topics. */
export function inferCategory(tags) {
  const t = new Set((tags || []).map(x => String(x).toLowerCase()))
  if (t.has('vision') || t.has('ocr') || t.has('image')) return 'tools'
  if (t.has('mcp') || t.has('claude') || t.has('codex') || t.has('integration')) return 'integration'
  if (t.has('skill') || t.has('skills') || t.has('agent-skills')) return 'skills'
  if (t.has('web') || t.has('ui') || t.has('skin') || t.has('sidebar')) return 'web'
  if (t.has('workflow') || t.has('orchestration') || t.has('automation')) return 'workflow'
  return 'other'
}
