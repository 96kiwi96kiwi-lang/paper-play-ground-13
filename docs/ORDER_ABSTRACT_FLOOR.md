# Order abstract floor

Refuse a present `abstract`, `orderAbstract`, or `clientAbstract` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order abstract, so an abstract-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-abstract.ts` and `tests/order-abstract.test.ts`.
