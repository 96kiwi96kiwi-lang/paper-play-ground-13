/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Hour 95 (odd): tif-alias floor wired after sz-alias.
 * submit calls tifAliasReason before the adapter.
 * A present tif, orderTif, or timeInForceAlias is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * See full source history for all previous floors.
 * Default remains paper. No secrets.
 */
