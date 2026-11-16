# Order purpose floor

A submit is refused when `purpose`, `orderPurpose`, or `clientPurpose` is present (`Order purpose is not supported` / `Order purpose alias is not supported` / `Client purpose alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order purpose, so a purpose intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderPurposeReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-purpose.test.ts` (no exchange, no secrets).
