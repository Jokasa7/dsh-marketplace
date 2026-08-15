/**
 * build-plugin-catalog.mjs
 * ------------------------
 * Emit the compact catalog the DSH in-harness client plugin embeds for its
 * `list` Remote. Reads web/public/github-plugins.json (the GitHub topic sync)
 * and writes a field-pruned `plugins.json` next to the client plugin's lib/.
 *
 * Run with:  node scripts/build-plugin-catalog.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'web', 'public', 'github-plugins.json')

if (!existsSync(src)) {
  console.error(`missing ${src}; run scripts/sync-github.mjs first`)
  process.exit(1)
}

const data = JSON.parse(readFileSync(src, 'utf8'))

/** Map a GitHub topic snapshot entry to the client plugin summary shape. */
function prune(plugin) {
  return {
    id: plugin.id,
    name: plugin.name,
    fullName: plugin.fullName,
    description: plugin.description ?? '',
    ...(plugin.descriptionZh ? { descriptionZh: plugin.descriptionZh } : {}),
    tags: plugin.tags ?? [],
    language: plugin.language ?? '',
    stars: plugin.stars ?? 0,
    verified: plugin.verified ?? false,
    install: {
      target: plugin.install?.target ?? 'git',
      spec: plugin.install?.spec ?? `github:${plugin.fullName}`,
      command: plugin.install?.command ?? `dsh plugin --profile {profile} add github:${plugin.fullName}`,
    },
    repository: plugin.repository ?? '',
    homepage: plugin.homepage ?? '',
  }
}

const pruned = (data.plugins ?? []).map(prune)

// Merge the curated entries' Chinese descriptions on top of the GitHub snapshot.
const curatedIndex = join(root, 'web', 'public', 'index.json')
if (existsSync(curatedIndex)) {
  const curated = JSON.parse(readFileSync(curatedIndex, 'utf8'))
  const byRepo = new Map()
  for (const p of pruned) byRepo.set(p.repository?.toLowerCase(), p)
  for (const c of curated.plugins ?? []) {
    const key = (c.repository ?? '').toLowerCase()
    const base = byRepo.get(key)
    if (base) {
      if (c.descriptionZh) base.descriptionZh = c.descriptionZh
      if (c.verified) base.verified = true
      if (c.description) base.description = c.description
      byRepo.set(key, base)
    } else {
      byRepo.set(key, {
        id: c.id,
        name: c.name,
        fullName: c.repository?.replace(/^https:\/\/github\.com\//, '') ?? c.id,
        description: c.description ?? '',
        ...(c.descriptionZh ? { descriptionZh: c.descriptionZh } : {}),
        tags: c.tags ?? [],
        language: '',
        stars: c.stars ?? 0,
        verified: c.verified ?? false,
        install: {
          target: c.install?.target ?? 'git',
          spec: c.install?.spec ?? c.id,
          command: c.install?.command ?? `dsh plugin --profile {profile} add ${c.id}`,
        },
        repository: c.repository ?? '',
        homepage: '',
      })
    }
  }
}

const out = join(root, 'plugin', 'client', 'lib', 'plugins.json')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify(pruned) + '\n')
console.log(`wrote ${out} (${pruned.length} plugins)`)
