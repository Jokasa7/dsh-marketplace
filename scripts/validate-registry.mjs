/**
 * validate-registry.mjs
 * ---------------
 * Validates every plugin entry in registry/plugins/<id>/plugin.json against:
 *   1. The JSON Schema at schema/plugin.schema.json
 *   2. Structural invariants (id matches directory name, category is known, etc.)
 *
 * Run with:  node scripts/validate-registry.mjs
 * Exit code 0 on success, 1 on any validation error. Used in CI (`npm run verify`)
 * so a malformed registry entry blocks a merge.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pluginsDir = join(root, 'registry', 'plugins')
const schemaPath = join(root, 'schema', 'plugin.schema.json')

const KNOWN_CATEGORIES = new Set([
  'skills', 'tools', 'web', 'infrastructure', 'integration', 'workflow', 'experimental', 'other',
])
const KNOWN_INSTALL_TARGETS = new Set(['npm', 'git', 'local'])

// Lightweight draft-07 subset validator (no runtime dep). Checks types,
// enums, requires, and a few patterns. A full Ajv dep is avoided to keep
// the repo dependency-light; extend here if a new schema rule is needed.
function validateAgainstSchema(value, schema, path = '') {
  const errors = []
  if (schema.required) {
    for (const key of schema.required) {
      if (!(key in value) || value[key] === undefined) {
        errors.push(`missing required property "${path}${key}"`)
      }
    }
  }
  const props = schema.properties || {}
  for (const [key, sub] of Object.entries(props)) {
    const v = value[key]
    if (v === undefined) continue
    const subPath = `${path}${key}.`
    if (sub.enum && !sub.enum.includes(v)) {
      errors.push(`"${path}${key}" must be one of ${JSON.stringify(sub.enum)} (got ${JSON.stringify(v)})`)
    }
    if (sub.type === 'string') {
      if (typeof v !== 'string') errors.push(`"${path}${key}" must be a string`)
      else if (sub.minLength && v.length < sub.minLength) errors.push(`"${path}${key}" too short`)
      else if (sub.pattern && !new RegExp(sub.pattern).test(v)) errors.push(`"${path}${key}" fails pattern /${sub.pattern}/`)
    } else if (sub.type === 'number') {
      if (typeof v !== 'number') errors.push(`"${path}${key}" must be a number`)
      else if (sub.minimum !== undefined && v < sub.minimum) errors.push(`"${path}${key}" must be >= ${sub.minimum}`)
    } else if (sub.type === 'boolean') {
      if (typeof v !== 'boolean') errors.push(`"${path}${key}" must be a boolean`)
    } else if (sub.type === 'array') {
      if (!Array.isArray(v)) errors.push(`"${path}${key}" must be an array`)
    } else if (sub.type === 'object') {
      if (typeof v !== 'object' || v === null) errors.push(`"${path}${key}" must be an object`)
      else errors.push(...validateAgainstSchema(v, sub, subPath))
    }
  }
  return errors
}

function main() {
  if (!existsSync(pluginsDir)) {
    console.error(`registry plugins dir not found: ${pluginsDir}`)
    process.exit(1)
  }
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
  const ids = readdirSync(pluginsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  if (ids.length === 0) {
    console.error('No plugin entries found under registry/plugins/.')
    process.exit(1)
  }

  let failCount = 0
  for (const id of ids) {
    const file = join(pluginsDir, id, 'plugin.json')
    let data
    try {
      data = JSON.parse(readFileSync(file, 'utf8'))
    } catch (err) {
      console.error(`\n[FAIL] ${id}/plugin.json is not valid JSON: ${err.message}`)
      failCount++
      continue
    }
    const errors = validateAgainstSchema(data, schema)

    // Structural invariants
    if (data.id !== id) errors.push(`id "${data.id}" must match directory name "${id}"`)

    const cat = data.category || ''
    if (!KNOWN_CATEGORIES.has(cat)) {
      errors.push(`category "${cat}" is unknown`)
    }
    const target = (data.install || {}).target
    if (!KNOWN_INSTALL_TARGETS.has(target)) {
      errors.push(`install.target "${target}" is unknown`)
    }
    const cmd = (data.install || {}).command || ''
    if (!cmd.includes('dsh plugin')) {
      errors.push('install.command must be a `dsh plugin ...` command')
    }
    if (!cmd.includes('{profile}')) {
      errors.push('install.command should use a {profile} placeholder so users can name their profile')
    }

    // Install spec consistency with target
    if (target === 'npm' && !/^@?[a-z0-9][a-z0-9._-]*(\/[a-z0-9._-]+)?$/.test((data.install || {}).spec || '')) {
      errors.push('install.spec for target=npm should be a valid npm package name')
    }
    if (target === 'git' && !/^(github:|git@|https:\/\/).+/.test((data.install || {}).spec || '')) {
      errors.push('install.spec for target=git should be a git spec (github:owner/repo, git@host:..., https://...)')
    }

    if (errors.length) {
      failCount++
      console.error(`\n[FAIL] ${id}`)
      for (const e of errors) console.error(`  - ${e}`)
    } else {
      console.log(`[ok]   ${id} (${data.name})`)
    }
  }

  console.log(`\n${ids.length - failCount}/${ids.length} entries valid.`)
  if (failCount) process.exit(1)
}

main()
