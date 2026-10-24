# Order session floor

A submit is refused when `session`, `orderSession`, or `clientSession` is present (`Session is not supported` / `Order session is not supported` / `Client session is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a session or order session. A session intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderSessionReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-session.test.ts` (no exchange, no secrets).
