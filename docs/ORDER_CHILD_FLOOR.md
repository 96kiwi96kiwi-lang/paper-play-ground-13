# Order Child Floor

Refuse present `childId`, `orderChild`, or `clientChild` on submit.

Paper and KuCoin spot adapters place one plain spot order and do not attach a child. A parent-child or bracket intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

`OrderManager.submit` calls `orderChildReason` after the order-payload floor and before the paper path. A refuse does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-child.ts` and `tests/order-child.test.ts`.
