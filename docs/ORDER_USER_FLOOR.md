# Order user floor

A submit is refused when `user`, `orderUser`, or `clientUser` is present (`User is not supported` / `Order user is not supported` / `Client user is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a user or order user. A user intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderUserReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-user.test.ts` (no exchange, no secrets).
