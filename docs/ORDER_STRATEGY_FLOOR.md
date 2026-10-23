# Order strategy floor

A submit is refused when `strategy`, `strategyId`, or `clientStrategy` is present (`Strategy is not supported` / `Strategy id is not supported` / `Client strategy is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a strategy or algo tag. A strategy intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderStrategyReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-strategy.test.ts` (no exchange, no secrets).
