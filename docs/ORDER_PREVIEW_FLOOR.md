# Order preview floor

Refuse a present `preview`, `orderPreview`, or `clientPreview` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order preview, so a preview-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-preview.ts` and `tests/order-preview.test.ts`.
