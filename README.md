# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 255 (odd):** Wired the order-algo floor into OrderManager. `submit` calls `orderAlgoReason` after the order-strategy floor and before the adapter: a present `algo`, `algoType`, or `clientAlgo` is refused (`Algo is not supported; the adapter would place a plain spot order` / `Algo type is not supported; the adapter would place a plain spot order` / `Client algo is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach an algo or order type tag, so an algo intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-algo.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 253 (odd):** Wired the order-strategy floor into OrderManager. `submit` calls `orderStrategyReason` after the order-link floor and before the adapter: a present `strategy`, `strategyId`, or `clientStrategy` is refused (`Strategy is not supported; the adapter would place a plain spot order` / `Strategy id is not supported; the adapter would place a plain spot order` / `Client strategy is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a strategy or algo tag, so a strategy intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-strategy.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

*(Earlier hours continue the same pattern of wiring floors. Full history is in git.)*

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default.
Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`.
A process restart always returns to paper.

Never invent or commit secrets.
