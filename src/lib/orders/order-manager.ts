/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Hour 99 (odd): value-alias floor wired after amount-alias.
 * submit calls valueAliasReason before the adapter.
 * A present value, orderValue, or baseValue is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * Hour 97 (odd): amount-alias floor wired after tif-alias.
 * submit calls amountAliasReason before the adapter.
 * A present amt, orderAmt, or baseAmt is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * See full source history for all previous floors.
 * Default remains paper. No secrets.
 */
