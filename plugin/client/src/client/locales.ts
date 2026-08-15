/**
 * Marketplace tab dictionaries (zh/en). Interpolated keys use named `{key}`
 * placeholders resolved by the DSH locale service via a params object.
 */

export interface LocaleDictionary {
  nav: string
  empty: string
  install: string
  installing: string
  verified: string
  searchPlaceholder: string
  loading: string
  count: string
  cancel: string
  confirmInstall: string
  confirmTitle: string
  confirmBody: string
  loadError: string
  installed: string
  installExit: string
  installFailed: string
}

export const en: Record<keyof LocaleDictionary, string> = {
  nav: 'Marketplace',
  empty: 'No plugins match your filters.',
  install: 'Install',
  installing: 'Installing…',
  verified: 'Verified',
  searchPlaceholder: 'Search plugins, tags, or categories…',
  loading: 'Loading catalog…',
  count: '{count} plugins',
  cancel: 'Cancel',
  confirmInstall: 'Install anyway',
  confirmTitle: 'Install {name}?',
  confirmBody: 'This runs `pnpm add` in your profile, which executes the plugin\u2019s code on your machine. Review the source first; a git install may run a prepare build script.',
  loadError: 'Failed to load catalog: {message}',
  installed: 'Installed (exit {code}). Restart the profile for the plugin to take effect.',
  installExit: 'Install finished with exit {code}: {detail}',
  installFailed: 'Install failed: {message}',
}

export const zh: Record<keyof LocaleDictionary, string> = {
  nav: '插件市场',
  empty: '没有匹配的插件。',
  install: '安装',
  installing: '安装中…',
  verified: '已验证',
  searchPlaceholder: '搜索插件、标签或分类…',
  loading: '加载目录中…',
  count: '{count} 个插件',
  cancel: '取消',
  confirmInstall: '仍要安装',
  confirmTitle: '安装 {name}？',
  confirmBody: '这会在你的 profile 中执行 `pnpm add`，即在该机器上运行插件代码。请先审阅源码；git 安装可能运行 prepare 构建脚本。',
  loadError: '加载目录失败：{message}',
  installed: '已安装（exit {code}）。重启 profile 后插件生效。',
  installExit: '安装结束（exit {code}）：{detail}',
  installFailed: '安装失败：{message}',
}

export type MarketplaceLocaleKey = keyof LocaleDictionary
