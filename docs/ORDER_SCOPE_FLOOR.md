# Order scope floor

A submit is refused when `scope`, `orderScope`, or `clientScope` is present (`Order scope is not supported` / `Order scope alias is not supported` / `Client scope alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order scope, so a scope intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderScopeReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-scope.test.ts` (no exchange, no secrets).
