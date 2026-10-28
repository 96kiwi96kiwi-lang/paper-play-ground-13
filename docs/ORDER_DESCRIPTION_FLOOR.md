# Order description floor

A submit is refused when `description`, `orderDescription`, or `clientDescription` is present (`Order description is not supported` / `Order description alias is not supported` / `Client description alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order description, so a description intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderDescriptionReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-description.test.ts` (no exchange, no secrets).
