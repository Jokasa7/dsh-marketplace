/**
 * Embedded snapshot of the DSH marketplace registry.
 * Generated from registry/plugins/* in the dsh-marketplace repo; kept inline so
 * the client bundle renders the catalog fully offline. Regenerate by copying
 * the repo's plugin/plugins.json into this module.
 */

export interface MarketplacePlugin {
  id: string
  name: string
  version?: string
  description: string
  license?: string
  category?: string
  tags: string[]
  verified?: boolean
  stars?: number
  install?: {
    target?: string
    spec?: string
    command?: string
  }
  repository?: string
}

export const CATALOG: MarketplacePlugin[] = [
  {
    "id": "deepseek-harness-for-codex",
    "name": "DSH for Codex",
    "version": "0.1.0",
    "description": "A Codex plugin and MCP server that runs DeepSeek Harness locally, delegates tasks through visible web sessions, and lets Codex independently review the results.",
    "license": "MIT",
    "category": "integration",
    "tags": ["codex", "mcp", "server", "integration", "delegation"],
    "verified": false,
    "stars": 8,
    "install": { "target": "git", "spec": "github:Seann0824/deepseek-harness-for-codex", "command": "dsh plugin --profile {profile} add github:Seann0824/deepseek-harness-for-codex" },
    "repository": "https://github.com/Seann0824/deepseek-harness-for-codex"
  },
  {
    "id": "dsh-mcp-client",
    "name": "MCP Client",
    "version": "1.0.0",
    "description": "Connect DeepSeek Harness to Model Context Protocol servers so your agent can call external MCP tools. Ships with the dsh CLI for patch layers that need server access.",
    "license": "MIT",
    "category": "infrastructure",
    "tags": ["mcp", "integration", "tools", "infrastructure"],
    "verified": true,
    "stars": 128,
    "install": { "target": "npm", "spec": "@deepseek-ai/dsh-mcp-client", "command": "dsh plugin --profile {profile} add @deepseek-ai/dsh-mcp-client" },
    "repository": "https://github.com/deepseek-harness/dsh-mcp-client"
  },
  {
    "id": "dsh-plugin-cc",
    "name": "dsh ↔ Claude Code bridge",
    "version": "0.1.0",
    "description": "Bridge DeepSeek Harness into Claude Code for review, critique, delegation, and session import. Lets two powerful agents collaborate on the same workspace.",
    "license": "MIT",
    "category": "integration",
    "tags": ["claude", "claude-code", "integration", "bridge", "review"],
    "verified": true,
    "stars": 25,
    "install": { "target": "npm", "spec": "dsh-plugin-cc", "command": "dsh plugin --profile {profile} add dsh-plugin-cc" },
    "repository": "https://github.com/cpj-dev/dsh-plugin-cc"
  },
  {
    "id": "superpowers-dsh",
    "name": "Superpowers for DSH",
    "version": "0.1.0",
    "description": "TDD, debugging, planning, and collaboration skills adapted from obra/superpowers for DeepSeek Harness. Gives your agent battle-tested working practices as loadable skills.",
    "license": "MIT",
    "category": "skills",
    "tags": ["skills", "tdd", "planning", "debugging", "productivity"],
    "verified": true,
    "stars": 42,
    "install": { "target": "npm", "spec": "superpowers-dsh", "command": "dsh plugin --profile {profile} add superpowers-dsh" },
    "repository": "https://github.com/LayneChai/superpowers-dsh"
  }
]

/** Substitute the display profile for the {profile} placeholder. */
export function installCommand(plugin: MarketplacePlugin, profile = 'web'): string {
  return (plugin.install?.command ?? `dsh plugin --profile ${profile} add ${plugin.install?.spec ?? plugin.id}`).replace('{profile}', profile)
}
