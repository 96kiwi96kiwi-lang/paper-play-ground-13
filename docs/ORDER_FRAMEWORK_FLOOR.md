# Order framework floor

A submit is refused when `framework`, `orderFramework`, or `clientFramework` is present (`Order framework is not supported` / `Order framework alias is not supported` / `Client framework alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order framework, so a framework intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderFrameworkReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-framework.test.ts` (no exchange, no secrets).
