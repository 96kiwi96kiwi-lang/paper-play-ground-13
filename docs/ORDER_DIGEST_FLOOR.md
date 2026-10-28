# Order digest floor

Refuse a present `digest`, `orderDigest`, or `clientDigest` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order digest, so a digest-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-digest.ts` and `tests/order-digest.test.ts`.
