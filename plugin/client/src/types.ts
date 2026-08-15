/**
 * Public request/value/failure vocabulary for the DSH Marketplace Remote.
 * Types only, so the generated Remote client can consume them without
 * importing host runtime code. All fields are plain JSON (no branded types)
 * so the Typert codec can derive the wire schema directly.
 * @module @dsh-marketplace/dsh-market/types
 */

/** One plugin summary returned by the marketplace `list` operation. */
export interface MarketplacePluginSummary {
  readonly id: string
  readonly name: string
  readonly fullName: string
  readonly description: string
  readonly descriptionZh?: string
  readonly tags: readonly string[]
  readonly language: string
  readonly stars: number
  readonly verified: boolean
  readonly install: {
    readonly target: string
    readonly spec: string
    readonly command: string
  }
  readonly repository: string
  readonly homepage: string
}

/** Payload of a successful `list`. */
export interface MarketplaceListValue {
  readonly plugins: readonly MarketplacePluginSummary[]
}

/** Success branch of `list`. */
export interface MarketplaceListSuccess {
  readonly ok: true
  readonly value: MarketplaceListValue
}

/** Result of the `list` operation. */
export type MarketplaceListResult = MarketplaceListSuccess

/** Payload of a successful `install`. */
export interface MarketplaceInstallValue {
  readonly exitCode: number
  readonly stdout: string
  readonly stderr: string
  /** A client plugin-set change only takes effect after a profile restart. */
  readonly restartRequired: boolean
}

/** Success branch of `install`. */
export interface MarketplaceInstallSuccess {
  readonly ok: true
  readonly value: MarketplaceInstallValue
}

/** Rejected branch of `install`. */
export interface MarketplaceInstallFailure {
  readonly ok: false
  readonly code: string
  readonly message: string
}

/** Result of the `install` operation. */
export type MarketplaceInstallResult = MarketplaceInstallSuccess | MarketplaceInstallFailure
