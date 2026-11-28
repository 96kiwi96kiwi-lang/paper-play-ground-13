# Order pattern floor

A submit is refused when `pattern`, `orderPattern`, or `clientPattern` is present (`Order pattern is not supported` / `Order pattern alias is not supported` / `Client pattern alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order pattern, so a pattern intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderPatternReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-pattern.test.ts` (no exchange, no secrets).
