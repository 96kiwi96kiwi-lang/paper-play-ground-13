# Order attribution floor

Refuse a present `attribution`, `orderAttribution`, or `clientAttribution` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order attribution, so an attribution-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-attribution.ts` and `tests/order-attribution.test.ts`.
