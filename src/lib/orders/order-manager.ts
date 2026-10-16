/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Hour 93 (odd): sz-alias floor wired after symbol-alias.
 * submit calls szAliasReason before the adapter.
 * A present sz, orderSz, or szValue is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * See full source history for all previous floors.
 * Default remains paper. No secrets.
 */
