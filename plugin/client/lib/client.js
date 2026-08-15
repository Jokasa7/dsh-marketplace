window.__ModuleLoader__.load({
	id: "@dsh-marketplace/dsh-market",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/catalog.ts
		const CATALOG = [
			{
				"id": "deepseek-harness-for-codex",
				"name": "DSH for Codex",
				"version": "0.1.0",
				"description": "A Codex plugin and MCP server that runs DeepSeek Harness locally, delegates tasks through visible web sessions, and lets Codex independently review the results.",
				"license": "MIT",
				"category": "integration",
				"tags": [
					"codex",
					"mcp",
					"server",
					"integration",
					"delegation"
				],
				"verified": false,
				"stars": 8,
				"install": {
					"target": "git",
					"spec": "github:Seann0824/deepseek-harness-for-codex",
					"command": "dsh plugin --profile {profile} add github:Seann0824/deepseek-harness-for-codex"
				},
				"repository": "https://github.com/Seann0824/deepseek-harness-for-codex"
			},
			{
				"id": "dsh-mcp-client",
				"name": "MCP Client",
				"version": "1.0.0",
				"description": "Connect DeepSeek Harness to Model Context Protocol servers so your agent can call external MCP tools. Ships with the dsh CLI for patch layers that need server access.",
				"license": "MIT",
				"category": "infrastructure",
				"tags": [
					"mcp",
					"integration",
					"tools",
					"infrastructure"
				],
				"verified": true,
				"stars": 128,
				"install": {
					"target": "npm",
					"spec": "@deepseek-ai/dsh-mcp-client",
					"command": "dsh plugin --profile {profile} add @deepseek-ai/dsh-mcp-client"
				},
				"repository": "https://github.com/deepseek-harness/dsh-mcp-client"
			},
			{
				"id": "dsh-plugin-cc",
				"name": "dsh ↔ Claude Code bridge",
				"version": "0.1.0",
				"description": "Bridge DeepSeek Harness into Claude Code for review, critique, delegation, and session import. Lets two powerful agents collaborate on the same workspace.",
				"license": "MIT",
				"category": "integration",
				"tags": [
					"claude",
					"claude-code",
					"integration",
					"bridge",
					"review"
				],
				"verified": true,
				"stars": 25,
				"install": {
					"target": "npm",
					"spec": "dsh-plugin-cc",
					"command": "dsh plugin --profile {profile} add dsh-plugin-cc"
				},
				"repository": "https://github.com/cpj-dev/dsh-plugin-cc"
			},
			{
				"id": "superpowers-dsh",
				"name": "Superpowers for DSH",
				"version": "0.1.0",
				"description": "TDD, debugging, planning, and collaboration skills adapted from obra/superpowers for DeepSeek Harness. Gives your agent battle-tested working practices as loadable skills.",
				"license": "MIT",
				"category": "skills",
				"tags": [
					"skills",
					"tdd",
					"planning",
					"debugging",
					"productivity"
				],
				"verified": true,
				"stars": 42,
				"install": {
					"target": "npm",
					"spec": "superpowers-dsh",
					"command": "dsh plugin --profile {profile} add superpowers-dsh"
				},
				"repository": "https://github.com/LayneChai/superpowers-dsh"
			}
		];
		/** Substitute the display profile for the {profile} placeholder. */
		function installCommand(plugin, profile = "web") {
			return (plugin.install?.command ?? `dsh plugin --profile ${profile} add ${plugin.install?.spec ?? plugin.id}`).replace("{profile}", profile);
		}
		//#endregion
		//#region \0dsh-css:E:\deepseek-harness\packages\extensions\dsh-marketplace\src\client\MarketplaceTab.module.css.mjs
		const css = ".FhmW0W_section{flex-direction:column;gap:12px;font-size:14px;display:flex}.FhmW0W_search{box-sizing:border-box;border:1px solid color-mix(in srgb, currentColor 25%, transparent);background:color-mix(in srgb, currentColor 6%, transparent);width:100%;color:inherit;border-radius:8px;padding:9px 12px;font-size:14px}.FhmW0W_card{border:1px solid color-mix(in srgb, currentColor 20%, transparent);border-radius:10px;flex-direction:column;gap:6px;padding:12px 14px;display:flex}.FhmW0W_top{justify-content:space-between;align-items:center;gap:8px;display:flex}.FhmW0W_name{margin:0;font-size:15px;font-weight:600}.FhmW0W_badges{flex:none;align-items:center;gap:6px;display:flex}.FhmW0W_verified{color:#31c48d;background:#31c48d33;border:1px solid #31c48d80;border-radius:999px;padding:1px 7px;font-size:11px}.FhmW0W_category{background:color-mix(in srgb, currentColor 12%, transparent);border-radius:999px;padding:1px 7px;font-size:11px}.FhmW0W_desc{color:color-mix(in srgb, currentColor 72%, transparent);margin:0}.FhmW0W_command{background:color-mix(in srgb, currentColor 8%, transparent);border:1px solid color-mix(in srgb, currentColor 18%, transparent);white-space:nowrap;user-select:all;border-radius:6px;padding:6px 8px;font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:12px;overflow-x:auto}.FhmW0W_empty{color:color-mix(in srgb, currentColor 60%, transparent);text-align:center;margin:0;padding:16px 0}";
		const tagId = "@dsh-marketplace/dsh-market/MarketplaceTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@dsh-marketplace/dsh-market";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MarketplaceTab_module_css_default = {
			"top": "FhmW0W_top",
			"category": "FhmW0W_category",
			"desc": "FhmW0W_desc",
			"name": "FhmW0W_name",
			"empty": "FhmW0W_empty",
			"command": "FhmW0W_command",
			"badges": "FhmW0W_badges",
			"search": "FhmW0W_search",
			"section": "FhmW0W_section",
			"card": "FhmW0W_card",
			"verified": "FhmW0W_verified"
		};
		//#endregion
		//#region src/client/MarketplaceTab.tsx
		/**
		* Marketplace settings tab: renders the embedded DSH plugin catalog with a
		* client-side search box and per-plugin install commands.
		*/
		function matches(plugin, q) {
			if (!q) return true;
			const needle = q.toLowerCase();
			return [
				plugin.name,
				plugin.description,
				plugin.id,
				plugin.category,
				...plugin.tags ?? []
			].some((field) => (field ?? "").toLowerCase().includes(needle));
		}
		/** Render one plugin card with its copyable install command. */
		function PluginCardView({ plugin, installLabel }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				className: MarketplaceTab_module_css_default.card,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: MarketplaceTab_module_css_default.top,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
							className: MarketplaceTab_module_css_default.name,
							children: plugin.name
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: MarketplaceTab_module_css_default.badges,
							children: [plugin.verified && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: MarketplaceTab_module_css_default.verified,
								children: installLabel
							}), plugin.category && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: MarketplaceTab_module_css_default.category,
								children: plugin.category
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: MarketplaceTab_module_css_default.desc,
						children: plugin.description
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
						className: MarketplaceTab_module_css_default.command,
						children: installCommand(plugin)
					})
				]
			});
		}
		/** Render the marketplace tab body: search + list of embedded plugins. */
		function MarketplaceTab({ t }) {
			const [query, setQuery] = (0, react.useState)("");
			const filtered = (0, react.useMemo)(() => CATALOG.filter((plugin) => matches(plugin, query)), [query]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: MarketplaceTab_module_css_default.section,
				children: [CATALOG.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: MarketplaceTab_module_css_default.search,
					type: "search",
					placeholder: t("searchPlaceholder"),
					value: query,
					onChange: (event) => setQuery(event.target.value),
					"aria-label": t("searchPlaceholder")
				}), filtered.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: MarketplaceTab_module_css_default.empty,
					children: t("empty")
				}) : filtered.map((plugin) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginCardView, {
					plugin,
					installLabel: t("verified")
				}, plugin.id))]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		const en = {
			nav: "Marketplace",
			title: "Plugin Marketplace",
			intro: "Browse, search, and install DSH community plugins. Install commands run through the dsh CLI.",
			empty: "No plugins match your search.",
			install: "Install",
			verified: "Verified",
			searchPlaceholder: "Search plugins, tags, or categories…"
		};
		const zh = {
			nav: "插件市场",
			title: "插件市场",
			intro: "浏览、搜索并安装 DSH 社区插件。安装命令通过 dsh CLI 执行。",
			empty: "没有匹配的插件。",
			install: "安装",
			verified: "已验证",
			searchPlaceholder: "搜索插件、标签或分类…"
		};
		//#endregion
		//#region src/client/index.ts
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.plugins.marketplace";
		/** Required services (cordis fiber inject): slot registry + locale. */
		const inject = ["slots", "locale"];
		/**
		* Mount the marketplace tab into the Plugins settings section.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-market: marketplace tab dictionaries");
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "marketplace",
				order: 30,
				label: () => t("nav"),
				locale: NS
			}, MarketplaceTab));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map