import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { resolveProfileDir } from "@deepseek-ai/dsh-app-boot";
//#region lib/types/index.js
/**
* DSH Marketplace Remote — host half.
*
* Exposes two Typert Remote operations to the browser:
*   - `list()`      → the embedded plugin catalog (offline snapshot)
*   - `install()`   → runs `pnpm add <spec>` in the target profile directory
*
* Installing third-party plugins executes their code on this machine, so the
* browser half must surface an explicit confirmation before calling `install`.
* @module @dsh-marketplace/dsh-market
*/
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Install specs the marketplace allows: npm names or github:owner/repo. */
const SPEC_PATTERN = /^(github:[\w.-]+\/[\w.-]+(?:#[0-9a-f]{7,40})?|@?[\w.-]+(?:\/[\w.-]+)?)$/;
/** Bound for each collected install stream. */
const MAX_OUTPUT_BYTES = 512 * 1024;
/** Directory of this compiled module (lib/), where plugins.json is shipped. */
const HERE = dirname(fileURLToPath(import.meta.url));
/** Embedded plugin catalog (generated from the marketplace registry). */
const catalog = JSON.parse(readFileSync(join(HERE, "plugins.json"), "utf8"));
/** Read the whole retained tail of one collected stream. */
function tailText(handle, key) {
	const reader = handle.collected[key];
	if (reader === void 0) return "";
	return reader.readFrom(0).text;
}
/**
* Validate a user-supplied install spec. Rejects anything that is not a bare
* npm package name, a scoped npm name, or a `github:owner/repo[#sha]` ref.
* The argv array is never shell-interpreted, so this is defense-in-depth on
* top of the argv boundary.
*/
function validateSpec(spec) {
	const trimmed = spec.trim();
	if (trimmed.length === 0) return "install spec is empty";
	if (trimmed.length > 256) return "install spec is too long";
	if (!SPEC_PATTERN.test(trimmed)) return `install spec ${JSON.stringify(trimmed)} is not an allowed npm or github: spec`;
}
let MarketplaceService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _list_decorators;
	let _installPlugin_decorators;
	return class MarketplaceService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_list_decorators = [Remote("list")];
			_installPlugin_decorators = [Remote("installPlugin")];
			__esDecorate(this, null, _list_decorators, {
				kind: "method",
				name: "list",
				static: false,
				private: false,
				access: {
					has: (obj) => "list" in obj,
					get: (obj) => obj.list
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _installPlugin_decorators, {
				kind: "method",
				name: "installPlugin",
				static: false,
				private: false,
				access: {
					has: (obj) => "installPlugin" in obj,
					get: (obj) => obj.installPlugin
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = ["subprocess"];
		/** @param ctx - host context carrying the subprocess service. */
		constructor(ctx) {
			super(ctx, "marketplace");
			__runInitializers(this, _instanceExtraInitializers);
		}
		/**
		* Return the embedded plugin catalog.
		* @returns the current offline snapshot.
		*/
		list() {
			return {
				ok: true,
				value: { plugins: catalog }
			};
		}
		/**
		* Install a plugin into a profile by forwarding `pnpm add <spec>` in that
		* profile's directory. The result is reported verbatim; the caller owns the
		* pre-execution confirmation and the post-install restart reminder.
		* @param profile - target profile name (validated by resolveProfileDir).
		* @param spec - npm package name or `github:owner/repo[#sha]`.
		* @returns exit facts plus collected output, or an explicit rejection.
		*/
		async installPlugin(profile, spec) {
			const specError = validateSpec(spec);
			if (specError !== void 0) return {
				ok: false,
				code: "bad-spec",
				message: specError
			};
			let dir;
			try {
				dir = resolveProfileDir(profile);
			} catch (error) {
				return {
					ok: false,
					code: "bad-profile",
					message: error.message
				};
			}
			const argv = process.platform === "win32" ? [
				"cmd.exe",
				"/d",
				"/s",
				"/c",
				"pnpm",
				"add",
				spec.trim()
			] : [
				"pnpm",
				"add",
				spec.trim()
			];
			try {
				const handle = this.ctx.subprocess.spawn({
					argv,
					cwd: dir,
					stdio: {
						stdin: "ignore",
						stdout: { maxBytes: MAX_OUTPUT_BYTES },
						stderr: { maxBytes: MAX_OUTPUT_BYTES }
					},
					graceMs: 12e4
				});
				return {
					ok: true,
					value: {
						exitCode: (await handle.done).exitCode ?? -1,
						stdout: tailText(handle, "stdout"),
						stderr: tailText(handle, "stderr"),
						restartRequired: true
					}
				};
			} catch (error) {
				return {
					ok: false,
					code: "spawn-failed",
					message: error.message
				};
			}
		}
	};
})();
//#endregion
export { MarketplaceService, MarketplaceService as default };
