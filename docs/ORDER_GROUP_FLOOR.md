# Order group floor

A submit is refused when `group`, `orderGroup`, or `clientGroup` is present (`Order group is not supported` / `Order group alias is not supported` / `Client group alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order group, so a group intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderGroupReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-group.test.ts` (no exchange, no secrets).
