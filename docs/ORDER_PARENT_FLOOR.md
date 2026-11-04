# Order parent floor

A submit is refused when `parentId`, `orderParent`, or `clientParent` is present (`Parent id is not supported` / `Order parent is not supported` / `Client parent is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a parent. A parent-child intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderParentReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-parent.test.ts` (no exchange, no secrets).
