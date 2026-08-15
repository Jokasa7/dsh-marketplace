# DSH Marketplace

An open-source **plugin marketplace for [DeepSeek Harness](https://github.com/deepseek-harness) (DSH)**.
Browse, search, and install community plugins with one copy-paste `dsh` command.

> Everything in DSH is a plugin. This marketplace is the storefront: a verified, auditable
> index of plugins you can install straight into your `dsh` profiles.

---

## ✨ Features

- **Static, auditable registry** — every plugin is a small JSON file (`registry/plugins/<id>/plugin.json`)
  reviewed through a normal GitHub PR. No database, no server to run.
- **One-command install** — every plugin card gives you the exact install command with your
  choice of profile (`web`, `headless`, custom), honoring DSH's real plugin mechanism:
  `dsh plugin --profile <name> add <spec>`.
- **Supports all DSH install sources** — npm packages, Git-hosted plugins
  (`github:owner/repo`), and local paths.
- **Verified badge** — maintainers/community can mark a plugin `verified` after review,
  following a governance model similar to curated marketplace projects.
- **Search & categories** — instant client-side search over names, descriptions, tags,
  and maintainers, plus category filtering (Skills, Tools, Web, Infrastructure, Integration,
  Workflow, Experimental).
- **Self-hostable** — pure static site. `npm run build`, then host `web/dist` anywhere
  (GitHub Pages, Netlify, Nginx, etc.).
- **Fast** — the UI loads a single gzipped `index.json`.
- **In-harness plugin** — the repository also ships a real DSH **client plugin**
  (`plugin/client/`) that renders a **Marketplace tab inside Settings → Plugins**
  of the DSH web GUI, so you can browse the catalog from within the harness itself.

## 🧩 How DSH plugins work (the model we build on)

DSH is built on [Cordis](https://github.com/cordiverse/cordis): **everything is a plugin**.
Plugins are npm packages managed by pnpm in a *profile* directory. To install one:

```bash
# npm package
dsh plugin --profile web add some-plugin-package

# Git-hosted plugin
dsh plugin --profile web add github:owner/repo
```

A plugin contributes a config layer by declaring `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`
in its `package.json`; when installed, `dsh` wires that patch into the profile's dependency
stack automatically. Discoverability uses the [`dsh-plugin`](https://github.com/topics/dsh-plugin)
GitHub topic. This marketplace indexes those plugins so people can find them.

## 📦 Project structure

```
dsh-marketplace/
├── registry/
│   ├── plugins/
│   │   └── <id>/plugin.json      # one manifest per plugin (the auditable source of truth)
│   └── ...
├── schema/
│   └── plugin.schema.json        # JSON Schema for plugin manifests
├── scripts/
│   ├── validate-registry.mjs     # validate all manifests (schema + invariants)
│   ├── build-registry.mjs        # aggregate manifests -> web/public/index.json (+ .gz)
│   └── build-meta.mjs            # write web/public/meta.json build metadata
├── web/
│   ├── src/                      # React app (search, categories, detail view)
│   ├── public/                   # generated index.json, favicon
│   └── vite.config.js
├── plugin/
│   └── client/                   # DSH client plugin — Marketplace tab in the web GUI settings
└── .github/workflows/            # CI: validate, build, deploy to GitHub Pages
```

## 🚀 Getting started

Requires **Node.js ≥ 18** and a recent `dsh` installation.

```bash
# 1. Install dev dependencies (Vite + React)
npm install

# 2. Validate the registry
npm run validate

# 3. Regenerate the combined index and build the static site
npm run build

# 4. Serve the built site locally
npm run serve       # dev server on :5173
npm run preview     # preview the production build on :4173
```

Open `http://localhost:5173` in a browser.

### Deploying

The build outputs a fully static site to `web/dist`. Host it anywhere static files are served:

```bash
npm run build
# then upload web/dist/ to your host, or use the included GitHub Actions workflow
```

The homepage and plugin entries live in `registry/`. The `index.json` (and `.gz` companion)
are regenerated on `npm run build` and can be committed so the site works immediately after clone.

## 🧩 In-harness Marketplace tab (client plugin)

The repository ships a **real DSH client plugin** under [`plugin/client/`](plugin/client/)
that renders a **Marketplace tab inside Settings → Plugins** of the running web
GUI. It mounts into the shared `settings.plugins.tab` slot and shows the embedded
catalog with search and per-plugin install commands — fully offline.

To install it into a profile (e.g. `web`):

```bash
pnpm add file:./plugin/client            # from the repo root
# then add a plugin row to "$DSH_HOME/profiles/web/cordis.patch.yml":
#   - insert:
#       - id: dsh-market
#         name: '@dsh-marketplace/dsh-market'
# and restart the web profile (pnpm dsh web)
```

Client plugin metadata is cached until restart, so a profile restart is required
after adding it. Building the bundle from source requires the DSH workspace
toolchain (`tsdown` + the `@deepseek-ai` workspace packages); the built
`lib/client.js` is committed so install works without a rebuild. See
[`plugin/client/README.md`](plugin/client/README.md).

## 🧱 Verifying install commands

Install commands are synthesized from each manifest's `install` field. Under the hood DSH
resolves them to real `dsh plugin --profile <name> add <spec>` calls, which forward to pnpm.
Git-hosted plugins that ship sources build during install via their `prepare` script; if a
pnpm allow-build prompt appears, copy the printed key into the profile's `pnpm-workspace.yaml`
and re-run (see the DSH reference docs).

## 📐 Registry schema

Each `registry/plugins/<id>/plugin.json` follows [`schema/plugin.schema.json`](schema/plugin.schema.json).
Minimal example:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "What it does.",
  "author": { "name": "you", "url": "https://github.com/you" },
  "license": "MIT",
  "category": "tools",
  "tags": ["example"],
  "compatibility": { "dsh": ">=0.1.0", "platforms": ["linux", "macos", "windows"] },
  "install": {
    "target": "npm",
    "spec": "my-plugin",
    "command": "dsh plugin --profile {profile} add my-plugin"
  },
  "verified": false,
  "repository": "https://github.com/you/my-plugin"
}
```

`install.target` is one of `npm` | `git` | `local`. `{profile}` is replaced by the user's
profile of choice (default: `web`). See [`CONTRIBUTING.md`](CONTRIBUTING.md) to add a plugin.

## 🌱 Design inspiration

This project synthesizes good ideas from the growing community around DSH:

- **Verified / auditable registry** — inspired by curated plugin-marketplace efforts
  (`dsh-plugin-marketplace`) that gate listings behind review.
- **Static, PR-reviewable JSON index** — from the "thin console over a static registry"
  approach used by community registry tooling, keeping the source of truth in Git.
- **Visual browse/search/install UI** — from visual plugin marketplaces, adapted to DSH's
  real `dsh plugin add` install path.
- **Scenario-first categories** (skills like TDD/debugging/planning) — from curated skill
  collections such as `superpowers-dsh`.
- **`dsh-plugin` topic discoverability** — lifted from the official DSH contributing guide.

## 🤝 Contributing

Yes, please! Add your plugin, improve the UI, or fix docs.

- **Add a plugin:** create `registry/plugins/<id>/plugin.json` and open a PR. Full guide in
  [`CONTRIBUTING.md`](CONTRIBUTING.md).
- **Governance:** statuses like `verified` are assigned by maintainers after review; a successful
  CI run (`npm run verify`) is required to merge.

## 📄 License

MIT. See [LICENSE](LICENSE).

## 🔗 Related

- [DeepSeek Harness](https://github.com/deepseek-harness) — the harness itself
- [`dsh-plugin` topic](https://github.com/topics/dsh-plugin) — community plugin discoverability
