/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Hour 85 (odd): price-alias floor wired after side-alias.
 * submit calls priceAliasReason before the adapter.
 * A present px, limitPx, or orderPrice is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * See full source history for all previous floors.
 * Default remains paper. No secrets.
 */
