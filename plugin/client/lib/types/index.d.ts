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
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { MarketplaceInstallResult, MarketplaceListResult } from './types.ts';
export type * from './types.ts';
export declare class MarketplaceService extends TypertRemoteService {
    static inject: string[];
    /** @param ctx - host context carrying the subprocess service. */
    constructor(ctx: Context);
    /**
     * Return the embedded plugin catalog.
     * @returns the current offline snapshot.
     */
    list(): MarketplaceListResult;
    /**
     * Install a plugin into a profile by forwarding `pnpm add <spec>` in that
     * profile's directory. The result is reported verbatim; the caller owns the
     * pre-execution confirmation and the post-install restart reminder.
     * @param profile - target profile name (validated by resolveProfileDir).
     * @param spec - npm package name or `github:owner/repo[#sha]`.
     * @returns exit facts plus collected output, or an explicit rejection.
     */
    install(profile: string, spec: string): Promise<MarketplaceInstallResult>;
}
export default MarketplaceService;
//# sourceMappingURL=index.d.ts.map