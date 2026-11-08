# Order Chain Floor

Refuse present `chainId`, `orderChain`, or `clientChain` on submit.

Paper and KuCoin spot adapters place one plain spot order and do not attach a chain. A multi-order chain intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

`OrderManager.submit` calls `orderChainReason` after the order-payload floor and before symbol/notional checks. A refuse does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-chain.ts` and `tests/order-chain.test.ts`.
