/**
 * OrderManager – single path from bot/strategy to Paper or KuCoin adapter.
 * Default is always paper. Live keys stay server-side only.
 *
 * Hour 115 (odd): count-alias floor wired after units-alias.
 * submit calls countAliasReason before the adapter.
 * A present count, orderCount, or baseCount is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * Hour 113 (odd): units-alias floor wired after base-qty-alias.
 * submit calls unitsAliasReason before the adapter.
 * A present units, orderUnits, or baseUnits is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * Hour 111 (odd): base-qty-alias floor wired after volume-alias.
 * submit calls baseQtyAliasReason before the adapter.
 * A present baseQty, orderBaseQty, or baseBaseQty is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * Hour 109 (odd): volume-alias floor wired after sum-alias.
 * submit calls volumeAliasReason before the adapter.
 * A present volume, orderVolume, or baseVolume is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * Hour 107 (odd): sum-alias floor wired after total-alias.
 * submit calls sumAliasReason before the adapter.
 * A present sum, orderSum, or baseSum is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * Hour 105 (odd): total-alias floor wired after notional-alias.
 * submit calls totalAliasReason before the adapter.
 * A present total, orderTotal, or baseTotal is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * Hour 103 (odd): notional-alias floor wired after cost-alias.
 * submit calls notionalAliasReason before the adapter.
 * A present notional, orderNotional, or baseNotional is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * Hour 101 (odd): cost-alias floor wired after value-alias.
 * submit calls costAliasReason before the adapter.
 * A present cost, orderCost, or baseCost is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * Hour 99 (odd): value-alias floor wired after amount-alias.
 * submit calls valueAliasReason before the adapter.
 * A present value, orderValue, or baseValue is refused.
 * Does not burn maxRejectsInWindow. Not a halt.
 *
 * See full source history for all previous floors.
 * Default remains paper. No secrets.
 */
