/**
 * sync-github.mjs
 * ---------------
 * Pull every public repo tagged with the `dsh-plugin` GitHub topic and emit a
 * machine-readable catalog (web/public/github-plugins.json) for the marketplace
 * UI. Each repo maps to a plugin entry with a `github:owner/repo` install spec
 * and its GitHub topics as classification tags.
 *
 * GitHub Search caps results at 1000 per query, so we fetch two orderings
 * (stars desc for the popular head, updated desc for the recently-active long
 * tail) and union them to cover as much of the topic as the API allows.
 *
 * Usage:
 *   $env:GITHUB_TOKEN = <token>   # or gh auth token
 *   node scripts/sync-github.mjs [--max 1000] [--out web/public/github-plugins.json]
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
if (!token) {
  console.error('sync-github: GITHUB_TOKEN (or GH_TOKEN) is required. Set it from `gh auth token`.')
  process.exit(1)
}

const API = 'https://api.github.com/search/repositories'
const HEADERS = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'dsh-marketplace',
  'X-GitHub-Api-Version': '2022-11-28',
}

function parseArgs(argv) {
  const out = { max: 1000, out: join(root, 'web', 'public', 'github-plugins.json') }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--max' && argv[i + 1]) out.max = Number(argv[i + 1])
    if (argv[i] === '--out' && argv[i + 1]) out.out = argv[i + 1]
  }
  return out
}

/** Fetch one page; returns { items, total }. */
async function searchPage(query, page, perPage = 100) {
  const url = `${API}?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`search page ${page} failed (${res.status}): ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  return { items: data.items ?? [], total: data.total_count ?? 0 }
}

/** Pull up to `max` repos for one query (stars-desc via searchPage). */
async function fetchQuery(query, max) {
  const perPage = 100
  const pages = Math.min(Math.ceil(max / perPage), 10) // GitHub hard caps at page 10
  const seen = new Map()
  for (let page = 1; page <= pages; page++) {
    const { items } = await searchPage(query, page, perPage)
    for (const repo of items) {
      if (!seen.has(repo.full_name)) seen.set(repo.full_name, repo)
    }
    if (items.length < perPage) break // no more pages
    // Be gentle with the search rate limit (30/min authenticated).
    if (page < pages) await new Promise(r => setTimeout(r, 2100))
  }
  return seen
}

function toPlugin(repo) {
  const full = repo.full_name
  const id = full.split('/').pop().toLowerCase().replace(/[^a-z0-9-_]/g, '-')
  return {
    id,
    name: repo.name,
    fullName: full,
    description: repo.description ?? '',
    category: null, // filled from topics client-side; keep null here
    tags: repo.topics ?? [],
    language: repo.language ?? '',
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    updatedAt: repo.updated_at ?? '',
    source: 'github',
    install: {
      target: 'git',
      spec: `github:${full}`,
      command: `dsh plugin --profile {profile} add github:${full}`,
    },
    repository: repo.html_url,
    homepage: repo.homepage ?? '',
    verified: false,
  }
}

async function main() {
  const args = parseArgs(process.argv)

  console.log('fetching topic:dsh-plugin (stars desc)…')
  const byStars = await fetchQuery('topic:dsh-plugin', args.max)
  console.log(`  got ${byStars.size} repos`)

  console.log('fetching topic:dsh-plugin (recently updated)…')
  // NOTE: search sorts by stars here too; to also capture the updated long tail
  // we re-query with a pushed filter is not supported directly, so we reuse the
  // stars ordering and rely on the union. A true updated-ordering would need the
  // `sort=updated` param — GitHub search supports `sort=updated`; do that below.
  const byUpdated = await fetchQueryUpdated(args.max)
  console.log(`  got ${byUpdated.size} repos`)

  const merged = new Map(byStars)
  for (const [k, v] of byUpdated) if (!merged.has(k)) merged.set(k, v)

  const plugins = [...merged.values()].map(toPlugin).sort((a, b) => b.stars - a.stars)

  const out = {
    schema: 'https://raw.githubusercontent.com/dsh-marketplace/registry/main/schema/plugin.schema.json',
    source: 'https://github.com/topics/dsh-plugin',
    generatedAt: new Date().toISOString(),
    count: plugins.length,
    plugins,
  }

  mkdirSync(dirname(args.out), { recursive: true })
  writeFileSync(args.out, JSON.stringify(out) + '\n')
  console.log(`wrote ${args.out} (${plugins.length} plugins)`)

  // Compact gzip companion for the web host.
  try {
    const { gzipSync } = await import('node:zlib')
    writeFileSync(args.out + '.gz', gzipSync(Buffer.from(JSON.stringify(out))))
    console.log(`wrote ${args.out}.gz`)
  } catch (err) {
    console.warn('gzip skipped:', err.message)
  }
}

/** Fetch with sort=updated to capture recently-active repos beyond the star head. */
async function fetchQueryUpdated(max) {
  const perPage = 100
  const pages = Math.min(Math.ceil(max / perPage), 10)
  const seen = new Map()
  for (let page = 1; page <= pages; page++) {
    const url = `${API}?q=${encodeURIComponent('topic:dsh-plugin')}&sort=updated&order=desc&per_page=${perPage}&page=${page}`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`updated search page ${page} failed (${res.status}): ${body.slice(0, 300)}`)
    }
    const data = await res.json()
    for (const repo of data.items ?? []) if (!seen.has(repo.full_name)) seen.set(repo.full_name, repo)
    if ((data.items ?? []).length < perPage) break
    if (page < pages) await new Promise(r => setTimeout(r, 2100))
  }
  return seen
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
