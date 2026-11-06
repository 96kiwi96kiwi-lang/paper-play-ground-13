# Order weight floor

A submit is refused when `weight`, `orderWeight`, or `clientWeight` is present (`Order weight is not supported` / `Order weight alias is not supported` / `Client weight alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order weight, so a weight intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderWeightReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-weight.test.ts` (no exchange, no secrets).
