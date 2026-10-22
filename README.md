# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 217 (odd):** Wired the trailing-stop floor into OrderManager. `submit` calls `trailingReason` after the cancel-on-disconnect floor and before the adapter: a present `trailingStop`, `trailingDelta`, `callbackRate`, or `activationPrice` is refused (`Trailing stop is not supported; the adapter would place a plain spot order` / `Trailing delta is not supported; the adapter would place a plain spot order` / `Callback rate is not supported; the adapter would place a plain spot order` / `Activation price is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not send a trailing callback or activation, so a trailing intent would otherwise be ignored and the order would rest or fill as a plain spot order at price or market. Omitted, null, false, and blank still pass; zero is refused. This is a trailing floor, not a halt, and does not flatten positions. Vitest: `tests/trailing.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 215 (odd):** Wired the cancel-on-disconnect floor into OrderManager. `submit` calls `cancelOnDisconnectReason` after the self-trade floor and before the adapter: a present `cancelOnDisconnect`, `deadman`, or `cod` is refused (`Cancel on disconnect is not supported; the adapter would leave a resting order` / `Dead-man switch is not supported; the adapter would leave a resting order` / `COD flag is not supported; the adapter would leave a resting order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not arm a cancel-on-disconnect timer, so a dead-man intent would otherwise be ignored and a resting order could stay live after the process drops. Omitted, null, false, and blank still pass; zero is refused. This is a disconnect floor, not a halt, and does not flatten positions. Vitest: `tests/cancel-on-disconnect.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

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
