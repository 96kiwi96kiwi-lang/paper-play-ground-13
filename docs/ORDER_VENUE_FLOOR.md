# ORDER VENUE FLOOR

The spot adapters (paper and KuCoin) place exactly one plain spot order. They do
not set an order venue or client venue. An intent that carries a present
`venue`, `orderVenue`, or `clientVenue` would therefore be silently ignored and
the order would rest or fill as a plain spot order on the wrong venue
assumption.

`OrderManager.submit` calls `orderVenueReason` after the order-template floor and
before the adapter. A present value is refused with a reason string and does not
burn the reject window. Omitted, null, false, and blank pass. Zero is present
and is refused.

This is a metadata floor, not a halt. It does not flatten positions and does not
change the paper-only default.

Vitest: `tests/order-venue.test.ts` (no exchange, no secrets).
