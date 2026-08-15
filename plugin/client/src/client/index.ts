/**
 * DSH Marketplace settings tab — browser half.
 *
 * Registers one tab into the shared Plugins settings section
 * (`settings.plugins.tab`), so it appears next to the configuration pages the
 * shell ships. The tab renders the embedded DSH community plugin catalog with
 * a search box and per-plugin install commands.
 */

// Type-only: pulls the settings shell's SlotMap merge (the
// 'settings.plugins.tab' slot entry). Cross-plugin collaboration goes through
// the service, never a value import (client bundle purity gate).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { MarketplaceTab } from './MarketplaceTab.tsx'
import { en, zh } from './locales.ts'

/** Dictionary namespace owned by this plugin. */
const NS = 'settings.plugins.marketplace'

/** Required services (cordis fiber inject): slot registry + locale. */
export const inject = ['slots', 'locale']

/**
 * Mount the marketplace tab into the Plugins settings section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(
    () => ctx.locale.register(NS, { zh, en }),
    'dsh-market: marketplace tab dictionaries',
  )

  // Register as a lazily-rendered tab inside the Plugins settings section.
  // `settings.plugins.tab` is a list slot owned by ui-settings-plugins; our
  // entry contributes one page (id 'marketplace'), ordered after the others.
  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'marketplace',
    order: 30,
    label: () => t('nav'),
    locale: NS,
  }, MarketplaceTab))
}
