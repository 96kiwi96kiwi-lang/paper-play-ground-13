/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Hour 91 (odd): symbol-alias floor wired after volume-alias.
 * submit calls symbolAliasReason before the adapter.
 * A present pair, market, or instrument is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * See full source history for all previous floors.
 * Default remains paper. No secrets.
 */
