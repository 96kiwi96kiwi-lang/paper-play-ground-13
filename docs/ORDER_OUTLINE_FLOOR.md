# Order outline floor

Refuse a present `outline`, `orderOutline`, or `clientOutline` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order outline, so an outline-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-outline.ts` and `tests/order-outline.test.ts`.
