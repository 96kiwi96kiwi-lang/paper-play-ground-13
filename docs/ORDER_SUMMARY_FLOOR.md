# Order summary floor

Refuse a present `summary`, `orderSummary`, or `clientSummary` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order summary, so a summary-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-summary.ts` and `tests/order-summary.test.ts`.
