# Order synopsis floor

Refuse a present `synopsis`, `orderSynopsis`, or `clientSynopsis` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order synopsis, so a synopsis-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-synopsis.ts` and `tests/order-synopsis.test.ts`.
