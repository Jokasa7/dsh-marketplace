/**
 * Marketplace settings tab: renders the full DSH plugin catalog (loaded through
 * the host `list` Remote) with search, tag filtering, and one-click install
 * behind an explicit confirmation dialog.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { MarketplaceInstallResult, MarketplacePluginSummary } from '@dsh-marketplace/dsh-market/types'
import css from './MarketplaceTab.module.css'

/** Business face injected by the registration. */
export interface MarketplaceTabInjected {
  /** List the catalog (calls the host `list` Remote). */
  list: () => Promise<readonly MarketplacePluginSummary[]>
  /** Install one plugin (calls the host `install` Remote). */
  install: (profile: string, spec: string) => Promise<MarketplaceInstallResult>
}

/** Props the renderer binds for this tab. */
export type MarketplaceTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.plugins.marketplace'>
  & InjectFace<MarketplaceTabInjected>

const NOISE_TAGS = new Set(['dsh-plugin', 'dsh', 'deepseek', 'deepseek-harness', 'harness'])

function matches(plugin: MarketplacePluginSummary, q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  return [
    plugin.name,
    plugin.fullName,
    plugin.description,
    plugin.descriptionZh,
    plugin.id,
    ...(plugin.tags ?? []),
    plugin.language,
  ].some(field => (field ?? '').toLowerCase().includes(needle))
}

function descriptionOf(plugin: MarketplacePluginSummary): string {
  return plugin.descriptionZh || plugin.description || ''
}

/** Render the marketplace tab body: search, tag filter, list, install. */
export function MarketplaceTab({ t, list, install }: MarketplaceTabProps) {
  const [plugins, setPlugins] = useState<readonly MarketplacePluginSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<MarketplacePluginSummary | null>(null)
  const [installing, setInstalling] = useState<MarketplacePluginSummary | null>(null)
  const [result, setResult] = useState<string>('')

  useEffect(() => {
    let alive = true
    list()
      .then(data => { if (alive) { setPlugins(data); setLoading(false) } })
      .catch(err => { if (alive) { setError(String(err)); setLoading(false) } })
    return () => { alive = false }
  }, [list])

  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of plugins) {
      for (const raw of p.tags ?? []) {
        const key = String(raw).toLowerCase()
        if (NOISE_TAGS.has(key)) continue
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 24)
  }, [plugins])

  const filtered = useMemo(() => {
    let listOut = plugins.filter(p => matches(p, query))
    if (activeTag) listOut = listOut.filter(p => (p.tags ?? []).some(raw => String(raw).toLowerCase() === activeTag))
    return listOut
  }, [plugins, query, activeTag])

  const doInstall = useCallback(async (plugin: MarketplacePluginSummary) => {
    setInstalling(plugin)
    setResult('')
    try {
      const res = await install('web', plugin.install.spec)
      if (res.ok) {
        setResult(res.value.exitCode === 0
          ? t('installed', { code: String(res.value.exitCode) })
          : t('installExit', { code: String(res.value.exitCode), detail: res.value.stderr || res.value.stdout }))
      } else {
        setResult(t('installFailed', { message: res.message }))
      }
    } catch (err) {
      setResult(t('installFailed', { message: String(err) }))
    } finally {
      setInstalling(null)
      setConfirming(null)
    }
  }, [install, t])

  if (loading) return <p className={css.empty}>{t('loading')}</p>
  if (error) return <p className={css.empty}>{t('loadError', { message: error })}</p>

  return (
    <div className={css.section}>
      <input
        className={css.search}
        type="search"
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={event => setQuery(event.target.value)}
      />

      {tags.length > 0 && (
        <div className={css.tagCloud}>
          {tags.map(({ tag, count }) => (
            <button
              key={tag}
              className={activeTag === tag ? `${css.tagChip} ${css.tagActive}` : css.tagChip}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag} <span className={css.tagCount}>{count}</span>
            </button>
          ))}
        </div>
      )}

      <div className={css.count}>{t('count', { count: String(filtered.length) })}</div>

      {filtered.length === 0
        ? <p className={css.empty}>{t('empty')}</p>
        : filtered.map(plugin => (
            <article key={plugin.repository || plugin.id} className={css.card}>
              <div className={css.cardTop}>
                <h4 className={css.cardTitle}>{plugin.name}</h4>
                <div className={css.cardMeta}>
                  {plugin.verified && <span className={css.verified}>✓ {t('verified')}</span>}
                  <span className={css.stars}>★ {plugin.stars}</span>
                </div>
              </div>
              <p className={css.desc}>{descriptionOf(plugin)}</p>
              <div className={css.cardTags}>
                {(plugin.tags ?? []).slice(0, 6).map(tag => <span key={tag} className={css.miniTag}>{tag}</span>)}
              </div>
              <div className={css.cardFoot}>
                <code className={css.command}>{plugin.install.command.replace('{profile}', 'web')}</code>
                <button
                  className={css.installBtn}
                  disabled={installing !== null}
                  onClick={() => setConfirming(plugin)}
                >
                  {installing === plugin ? t('installing') : t('install')}
                </button>
              </div>
            </article>
          ))}

      {confirming && (
        <div className={css.confirmBackdrop} onClick={() => setConfirming(null)}>
          <div className={css.confirmBox} onClick={event => event.stopPropagation()}>
            <h4>{t('confirmTitle', { name: confirming.name })}</h4>
            <p className={css.confirmText}>{t('confirmBody')}</p>
            <code className={css.confirmCmd}>{confirming.install.command.replace('{profile}', 'web')}</code>
            <div className={css.confirmActions}>
              <button className={css.cancelBtn} onClick={() => setConfirming(null)}>{t('cancel')}</button>
              <button className={css.confirmBtn} onClick={() => doInstall(confirming)}>{t('confirmInstall')}</button>
            </div>
          </div>
        </div>
      )}

      {result && <pre className={css.result}>{result}</pre>}
    </div>
  )
}
