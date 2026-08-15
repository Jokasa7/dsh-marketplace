# Contributing

Thanks for helping grow the DSH ecosystem! This project is a community plugin
marketplace for DeepSeek Harness. There are two main ways to contribute:

1. **Add a plugin** to the registry (the most common contribution).
2. **Improve the marketplace** code (UI, scripts, docs, CI).

---

## Adding a plugin

### Requirements for a good listing

- Your plugin is **publicly installable** via one of DSH's install sources:
  - an npm package (install target `npm`),
  - a Git repository (install target `git`, e.g. `github:owner/repo`),
  - or a local `file:` path (install target `local`).
- The manifest passes `npm run validate`.
- The `install.command` uses `dsh plugin --profile {profile} add <spec>` with the `{profile}`
  placeholder (users pick their own profile).
- Tag your plugin's GitHub repository with the
  [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic for broader discoverability
  (recommended by the official DSH contributing guide).

### Step-by-step

1. **Fork this repo** and clone it.

2. **Create the manifest:**

   ```bash
   mkdir -p registry/plugins/<your-plugin-id>
   ```

   Create `registry/plugins/<your-plugin-id>/plugin.json`. The `id` must:
   - match the directory name exactly,
   - be lowercase, starting with a letter/number, using `-`/`_` only.

   Start from the minimal example in [the README](README.md#-registry-schema).

3. **Validate locally:**

   ```bash
   npm install
   npm run validate
   ```

   Fix any reported errors.

4. **Regenerate the index** (so your plugin is queryable immediately):

   ```bash
   npm run build
   ```

5. **Open a Pull Request.** A maintainer will review:

   - manifest correctness (schema + invariants),
   - whether the install spec is reachable/documented,
   - safety, if relevant.

   CI runs `npm run verify` (validate + build). **A green CI run is required to merge.**

### Verification / `verified: true`

`verified` is **set by maintainers only**, after they confirm the plugin installs cleanly from
the recorded spec. Set it to `false` when first adding a listing; a maintainer will flip it to
`true` once reviewed. This keeps the marketplace's "verified" badge meaningful.

### What about `deprecated`?

Set `deprecated: true` when a plugin should no longer be recommended. It will be visually
flagged in the UI but remain discoverable for existing users.

---

## Improving the code

- The web app is `web/src/` (Vite + React, plain CSS — no heavy UI framework).
- Registry tooling is in `scripts/` (validators + index builders).
- Keep the site **static and dependency-light**: no backend, no database.

### Local setup

```bash
npm install
npm run serve      # dev server with the registry served from web/public
npm run build      # build the static site into web/dist
npm run verify     # validate + build (what CI runs)
```

### Conventions

- JSON manifests: 2-space indent, trailing newline.
- New registry fields go in `schema/plugin.schema.json` **and** the validator in
  `scripts/validate-registry.mjs`.
- UI copy is English-first; feel free to add i18n for other locales.

---

## Code of Conduct

Be respectful and constructive. This is a community project — please help keep it welcoming.
