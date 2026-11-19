# Order saga floor

A submit is refused when `saga`, `sagaId`, or `clientSaga` is present (`Saga is not supported` / `Saga id is not supported` / `Client saga is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a saga or narrative tag. A saga intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderSagaReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-saga.test.ts` (no exchange, no secrets).
