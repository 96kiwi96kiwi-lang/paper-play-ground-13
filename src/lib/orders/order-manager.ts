/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Hour 83 (odd): side-alias floor wired after order-expiry.
 * submit calls sideAliasReason before the adapter.
 * A present orderSide, direction, or action is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * See full source history for all previous floors.
 * Default remains paper. No secrets.
 */
