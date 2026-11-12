# Order brief floor

Refuse a present `brief`, `orderBrief`, or `clientBrief` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order brief, so a brief-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-brief.ts` and `tests/order-brief.test.ts`.
