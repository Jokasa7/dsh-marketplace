/**
 * DSH Marketplace settings tab — node half.
 * The empty apply exists so the plugin appears in the host cordis.yml and
 * Loader; the browser half ships through exports["./client"] and is discovered
 * through the package.json `dsh.client` declaration.
 */

/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply(): void {}
