# Order expiry floor

A submit is refused when `cancelAfter`, `expireTime`, or `goodTillDate` is present (`Cancel after is not supported` / `Expire time is not supported` / `Good till date is not supported`).

Paper and KuCoin adapters place one plain spot order and do not forward these expiry fields, so the order would rest until a later cancel instead of expiring.

Omitted, null, and blank still pass. Zero is present and is refused. GTT time-in-force remains its own floor.

This is an expiry floor, not a halt, and does not flatten positions.

Vitest: `tests/order-expiry.test.ts` (no exchange, no secrets).
