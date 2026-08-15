/**
 * Marketplace settings tab: renders the embedded DSH plugin catalog with a
 * client-side search box and per-plugin install commands.
 */

import { useMemo, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { CATALOG, installCommand, type MarketplacePlugin } from './catalog.ts'
import type { MarketplaceLocaleKey } from './locales.ts'
import css from './MarketplaceTab.module.css'

/** Props the renderer binds for this tab. */
export type MarketplaceTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.plugins.marketplace'>

function matches(plugin: MarketplacePlugin, q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  return [
    plugin.name,
    plugin.description,
    plugin.id,
    plugin.category,
    ...(plugin.tags ?? []),
  ].some(field => (field ?? '').toLowerCase().includes(needle))
}

/** Render one plugin card with its copyable install command. */
function PluginCardView({ plugin, installLabel }: { plugin: MarketplacePlugin; installLabel: string }) {
  return (
    <article className={css.card}>
      <div className={css.top}>
        <h4 className={css.name}>{plugin.name}</h4>
        <div className={css.badges}>
          {plugin.verified && <span className={css.verified}>{installLabel}</span>}
          {plugin.category && <span className={css.category}>{plugin.category}</span>}
        </div>
      </div>
      <p className={css.desc}>{plugin.description}</p>
      <code className={css.command}>{installCommand(plugin)}</code>
    </article>
  )
}

/** Render the marketplace tab body: search + list of embedded plugins. */
export function MarketplaceTab({ t }: MarketplaceTabProps) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => CATALOG.filter(plugin => matches(plugin, query)), [query])

  return (
    <div className={css.section}>
      {CATALOG.length > 1 && (
        <input
          className={css.search}
          type="search"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={event => setQuery(event.target.value)}
          aria-label={t('searchPlaceholder')}
        />
      )}
      {filtered.length === 0
        ? <p className={css.empty}>{t('empty')}</p>
        : filtered.map(plugin => (
            <PluginCardView key={plugin.id} plugin={plugin} installLabel={t('verified')} />
          ))}
    </div>
  )
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Marketplace tab copy. */
    'settings.plugins.marketplace': MarketplaceLocaleKey
  }
}
