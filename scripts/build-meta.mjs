/**
 * build-meta.mjs
 * --------------
 * Writes web/public/meta.json with build-time metadata (generator, count,
 * generatedAt). Consumed by the site footer / debugging.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pluginsDir = join(root, 'registry', 'plugins')
const publicDir = join(root, 'web', 'public')
mkdirSync(publicDir, { recursive: true })

let count = 0
try {
  count = readdirSync(pluginsDir, { withFileTypes: true }).filter(d => d.isDirectory()).length
} catch { /* no plugins yet */ }

const meta = {
  generator: 'dsh-marketplace',
  generatedAt: new Date().toISOString(),
  count,
  pluginsDir,
}
writeFileSync(join(publicDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n')
console.log(`wrote web/public/meta.json (count=${count})`)
