/**
 * Marketplace tab dictionaries (zh/en).
 */

export interface LocaleDictionary {
  nav: string
  title: string
  intro: string
  empty: string
  install: string
  verified: string
  searchPlaceholder: string
}

export const en: Record<keyof LocaleDictionary, string> = {
  nav: 'Marketplace',
  title: 'Plugin Marketplace',
  intro: 'Browse, search, and install DSH community plugins. Install commands run through the dsh CLI.',
  empty: 'No plugins match your search.',
  install: 'Install',
  verified: 'Verified',
  searchPlaceholder: 'Search plugins, tags, or categories…',
}

export const zh: Record<keyof LocaleDictionary, string> = {
  nav: '插件市场',
  title: '插件市场',
  intro: '浏览、搜索并安装 DSH 社区插件。安装命令通过 dsh CLI 执行。',
  empty: '没有匹配的插件。',
  install: '安装',
  verified: '已验证',
  searchPlaceholder: '搜索插件、标签或分类…',
}

export type MarketplaceLocaleKey = keyof LocaleDictionary
