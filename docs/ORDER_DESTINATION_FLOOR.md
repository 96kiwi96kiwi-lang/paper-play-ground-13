# ORDER DESTINATION FLOOR

The spot adapters (paper and KuCoin) place exactly one plain spot order. They do
not set an order destination or client destination. An intent that carries a
present `destination`, `orderDestination`, or `clientDestination` would
therefore be silently ignored and the order would rest or fill as a plain spot
order against the wrong destination assumption.

`OrderManager.submit` calls `orderDestinationReason` after the order-venue floor
and before the adapter. A present value is refused with a reason string and does
not burn the reject window. Omitted, null, false, and blank pass. Zero is
present and is refused.

This is a metadata floor, not a halt. It does not flatten positions and does not
change the paper-only default.

Vitest: `tests/order-destination.test.ts` (no exchange, no secrets).
