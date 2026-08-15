# DSH Marketplace — Web UI client plugin

This package embeds the **DSH Marketplace** as a native tab inside the DeepSeek
Harness **Plugins settings section** of the web GUI. It is a real DSH
**client (browser) plugin** (`dsh.client`), so it renders right inside the
running harness rather than as a separate website.

## What it adds

In the web GUI, open **Settings → Plugins**. A new **Marketplace** tab renders
alongside the configuration tabs, with:

- The embedded DSH community plugin catalog (searchable by name, description,
  tag, or category).
- Each plugin card shows its verified badge, category, description, and a
  **copyable install command** (`dsh plugin --profile web add <spec>`).

> Security note: install commands are shown for the user to run themselves —
> the plugin never executes `dsh plugin add`. Installing a plugin runs its
> code on your machine (git-hosted plugins may run a `prepare` build), so you
> should review before installing.

## How it works

- `package.json` declares `dsh.client` (`platform: 'web'`), so the host's
  client-module scanner discovers it and serves the built bundle at
  `/plugins/@dsh-marketplace/dsh-market/client.js`.
- `src/client/index.ts` registers one entry into the shared
  `settings.plugins.tab` slot (owned by `@deepseek-ai/dsh-client-ui-settings`),
  rendering the tab.
- `src/client/catalog.ts` embeds a snapshot of the marketplace registry, so the
  tab works fully offline with zero server calls.
- `src/index.ts` is the empty node half that places the package in the
  composition and Loader.

## Build

The browser bundle must be built with the DSH workspace toolchain (`tsdown`),
because it depends on the `@deepseek-ai/dsh-client-*` workspace packages and the
`clientBundle` preset (`tsdown.client.ts`). This package will **not** build
standalone outside a DSH checkout.

Within a DSH checkout (as this fixture: `packages/extensions/dsh-marketplace`):

```bash
pnpm install          # links workspace deps
cd packages/extensions/dsh-marketplace
pnpm run bundle       # emits lib/index.js + lib/client.js
```

The built `lib/client.js` (and `lib/client.js.map`) are committed here so the
package can be installed without a rebuild.

## Install into a harness

To use it, install the package into the target profile and mount it:

```bash
# 1. add the package to the profile (pnpm)
pnpm add file:<this directory> --dir "$DSH_HOME/profiles/web"

# 2. mount it as a plugin row in the profile's cordis.patch.yml
```

```yaml
# "$DSH_HOME/profiles/web/cordis.patch.yml"
- insert:
    - id: dsh-market
      name: '@dsh-marketplace/dsh-market'
```

Then restart the web profile (client package metadata is cached until restart):

```bash
pnpm dsh web
```

Open **Settings → Plugins → Marketplace**.
