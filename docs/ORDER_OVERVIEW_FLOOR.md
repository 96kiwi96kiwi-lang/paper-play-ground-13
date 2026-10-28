# Order overview floor

Refuse a present `overview`, `orderOverview`, or `clientOverview` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order overview, so an overview-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-overview.ts` and `tests/order-overview.test.ts`.
