# Order Root Floor

Refuse present `rootId`, `orderRoot`, or `clientRoot` on submit.

Paper and KuCoin spot adapters place one plain spot order and do not attach a root. A tree or multi-leg intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

`OrderManager.submit` calls `orderRootReason` after the order-child floor and before the paper path. A refuse does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-root.ts` and `tests/order-root.test.ts`.
