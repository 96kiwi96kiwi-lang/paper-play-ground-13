# Order Session Floor

A submit is refused when `session`, `orderSession`, or `clientSession` is present (`Order session is not supported` / `Order session alias is not supported` / `Client session alias is not supported`).

Paper and KuCoin spot adapters place one plain spot order and do not attach a session tag. A session intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

`OrderManager.submit` calls `orderSessionReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-session.test.ts` (no exchange, no secrets).
