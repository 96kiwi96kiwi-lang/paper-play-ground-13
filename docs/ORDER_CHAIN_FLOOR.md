# Order Chain Floor

Refuse present `chainId`, `orderChain`, or `clientChain` on submit.

Paper and KuCoin spot adapters place one plain spot order and do not attach a chain. A multi-order chain intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

`OrderManager.submit` should call `orderChainReason` after the order-related floor and before the paper path. A refuse does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-chain.ts` and `tests/order-chain.test.ts`.
