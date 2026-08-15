/**
 * DSH Marketplace settings tab — browser half.
 *
 * Mounts this package's generated Host Remote contribution and registers one
 * tab into the shared Plugins settings section (`settings.plugins.tab`). The
 * tab renders the full catalog (fetched through the `list` Remote) with tag
 * filtering, and its Install button calls the `install` Remote after an
 * explicit confirmation dialog.
 */

import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import marketplaceRemote from '@dsh-marketplace/dsh-market/remote'
import { MarketplaceTab } from './MarketplaceTab.tsx'
import type { MarketplaceTabInjected } from './MarketplaceTab.tsx'
import { en, zh, type MarketplaceLocaleKey } from './locales.ts'

export type { MarketplaceTabInjected, MarketplaceTabProps } from './MarketplaceTab.tsx'
export type { MarketplaceLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'settings.plugins.marketplace': MarketplaceLocaleKey
  }
}

/** Dictionary namespace owned by this plugin. */
export const NS = 'settings.plugins.marketplace'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale', 'remote']

/**
 * Mount the marketplace tab and its Remote contribution.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(
    () => ctx.locale.register(NS, { zh, en }),
    'dsh-market: marketplace dictionaries',
  )

  // Mount this package's generated Remote namespace exactly once, on first use.
  let mountPromise: Promise<void> | undefined
  const ensureRemote = (): Promise<void> => {
    if (mountPromise === undefined) {
      mountPromise = ctx.remote.$mount(marketplaceRemote).then(() => undefined)
    }
    return mountPromise
  }

  const injected = (): MarketplaceTabInjected => ({
    list: async () => {
      await ensureRemote()
      const result = await ctx.remote.marketplace.list()
      if (!result.ok) throw new Error(`marketplace.list failed: ${result.error.message}`)
      const business = result.value
      if (!business.ok) throw new Error('marketplace.list returned a business failure')
      return business.value.plugins
    },
    install: async (profile, spec) => {
      await ensureRemote()
      const result = await ctx.remote.marketplace.installPlugin(profile, spec)
      if (!result.ok) throw new Error(`marketplace.installPlugin failed: ${result.error.message}`)
      return result.value
    },
  })

  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'marketplace',
    order: 30,
    label: () => t('nav'),
    locale: NS,
    inject: injected,
  }, MarketplaceTab))
}
