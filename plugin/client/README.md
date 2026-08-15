# DSH Marketplace — in-harness plugin (dual-face)

This package embeds the **DSH Marketplace** as a native tab inside the DeepSeek
Harness **Plugins settings section** of the web GUI. It is a **dual-face** DSH
plugin: a host **Typert Remote** plus a browser client bundle.

## What it adds

In the web GUI, open **Settings → Plugins → Marketplace** (插件市场). The tab:

- Lists the **full GitHub `dsh-plugin` catalog** (1,662 plugins at last sync),
  loaded through the host `list` Remote.
- **Tag filtering** — aggregate all plugin `topics` into clickable tag chips.
- Search by name, description, tag, language.
- **One-click install** — the Install button calls the host `install` Remote,
  which runs `pnpm add <spec>` in the target profile, **after an explicit
  confirmation dialog** and with a post-install restart reminder.
- Chinese-first descriptions (`descriptionZh`) for curated entries; GitHub's
  own bilingual descriptions otherwise.

> Security note: installing a plugin executes its code on your machine
> (git-hosted plugins may run a `prepare` build). The UI always asks for
> confirmation first, and the host validates the install spec.

## How it works

- **Host half** (`src/index.ts`) — `MarketplaceService extends TypertRemoteService`
  exposing two `@Remote` methods:
  - `list()` → the embedded catalog (read from `lib/plugins.json`).
  - `install(profile, spec)` → `ctx.subprocess.spawn(pnpm add <spec>)` in the
    resolved profile directory, returning exit facts + collected output.
- **Browser half** (`src/client/index.ts`) — mounts the generated Remote
  contribution (`ctx.remote.$mount`) and registers a `settings.plugins.tab`
  entry rendering `MarketplaceTab`.
- **`cordis.patch.yml`** — the bundle patch inserting the plugin row (one row
  mounts both halves); declared via `dsh.bundle.patch` in package.json.

## Build

Building requires the DSH workspace toolchain (Typert generator + tsdown +
`@deepseek-ai` workspace deps). It will **not** build standalone.

Within a DSH checkout (placed at `packages/extensions/dsh-marketplace`):

```bash
pnpm install
pnpm exec tsc -b tsconfig.host.json          # host types
pnpm exec tsdown --env.DSH_BUILD_FACE host   # typert generate lib/typert.*
pnpm exec tsc -b tsconfig.client.json        # client types
pnpm exec tsdown --env.DSH_BUILD_FACE client # browser bundle lib/client.js
```

The built artifacts (`lib/index.js`, `lib/client.js`, `lib/typert.*`,
`lib/plugins.json`) are committed so the package installs without a rebuild.

## Install into a harness

Because the package declares `dsh.bundle.patch`, a normal `dsh plugin add`
installs it **and** reconciles it into the profile's bundle list:

```bash
dsh plugin --profile web add file:<this directory>
```

If adding manually, ensure the profile lists the bundle and that no duplicate
`dsh-market` row is inserted (the package's own patch supplies it):

```jsonc
// "$DSH_HOME/profiles/web/package.json"
{ "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "@dsh-marketplace/dsh-market"] } } }
```

Then restart the web profile (client plugin metadata is cached until restart):

```bash
pnpm dsh web
```

Open **Settings → Plugins → Marketplace**.

## Refresh the catalog

The embedded `lib/plugins.json` is generated from the marketplace repo:

```bash
# in the dsh-marketplace repo root
node scripts/sync-github.mjs          # refresh web/public/github-plugins.json
node scripts/build-plugin-catalog.mjs # emit plugin/client/lib/plugins.json
```
