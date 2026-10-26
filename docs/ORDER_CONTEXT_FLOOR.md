# Order context floor

A submit is refused when `context`, `orderContext`, or `clientContext` is present (`Context is not supported` / `Order context is not supported` / `Client context is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a context or order context. A context intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderContextReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-context.test.ts` (no exchange, no secrets).
