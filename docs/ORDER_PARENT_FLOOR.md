# Order Parent Floor

Refuse present `parentId`, `orderParent`, or `clientParent` on submit.

Paper and KuCoin spot adapters place one plain spot order and do not attach a parent. A parent-child or linked intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

`OrderManager.submit` calls `orderParentReason` after the order-sibling floor and before the paper path. A refuse does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-parent.ts` and `tests/order-parent.test.ts`.
