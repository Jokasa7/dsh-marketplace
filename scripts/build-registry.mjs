/**
 * build-registry.mjs
 * ------------------
 * Aggregates every registry/plugins/<id>/plugin.json into a single
 * public/index.json used by the web UI. This keeps the source of truth as
 * many small PR-reviewable JSON files while serving one fast combined index.
 *
 * Run with:  node scripts/build-registry.mjs
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pluginsDir = join(root, 'registry', 'plugins')
const publicDir = join(root, 'web', 'public')
mkdirSync(publicDir, { recursive: true })

const ids = readdirSync(pluginsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort()

const plugins = []
for (const id of ids) {
  const file = join(pluginsDir, id, 'plugin.json')
  if (!existsSync(file)) {
    console.warn(`skip ${id}: missing plugin.json`)
    continue
  }
  plugins.push(JSON.parse(readFileSync(file, 'utf8')))
}

const index = {
  schema: 'https://raw.githubusercontent.com/dsh-marketplace/registry/main/schema/plugin.schema.json',
  generatedAt: new Date().toISOString(),
  count: plugins.length,
  plugins,
}

const out = join(publicDir, 'index.json')
// Pretty-print for diff-ability in PRs; gzip keeps the wire size small.
writeFileSync(out, JSON.stringify(index, null, 2) + '\n')
console.log(`wrote ${out} (${plugins.length} plugins)`)

// Gzip companion for hosts that can serve precompressed payloads.
try {
  const { gzipSync } = await import('node:zlib')
  writeFileSync(join(publicDir, 'index.json.gz'), gzipSync(Buffer.from(JSON.stringify(index))))
  console.log('wrote web/public/index.json.gz')
} catch (err) {
  console.warn('gzip companion skipped:', err.message)
}
