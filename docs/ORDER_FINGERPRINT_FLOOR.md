# Order fingerprint floor

Refuse a present `fingerprint`, `orderFingerprint`, or `clientFingerprint` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order fingerprint, so a fingerprint-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-fingerprint.ts` and `tests/order-fingerprint.test.ts`.
