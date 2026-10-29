# Order expiry floor

A submit is refused when `expiry`, `orderExpiry`, or `clientExpiry` is present (`Order expiry is not supported` / `Order expiry alias is not supported` / `Client expiry alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order expiry, so an expiry intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderExpiryReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-expiry.test.ts` (no exchange, no secrets).
