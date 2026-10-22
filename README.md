# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 219 (odd):** Wired the cancel-replace floor into OrderManager. `submit` calls `cancelReplaceReason` after the trailing floor and before the adapter: a present `cancelReplace`, `cancelOrderId`, or `orderIdToCancel` is refused (`Cancel-replace is not supported; the adapter would place a new order and leave the old one resting` / `Cancel order id is not supported; the adapter would place a new order and leave the old one resting` / `Order id to cancel is not supported; the adapter would place a new order and leave the old one resting`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not cancel a named resting order, so a replace intent would otherwise leave both the old and new orders resting. Omitted, null, false, and blank still pass; zero is refused. This is a replace floor, not a halt, and does not flatten positions. Vitest: `tests/cancel-replace.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 217 (odd):** Wired the trailing-stop floor into OrderManager. `submit` calls `trailingReason` after the cancel-on-disconnect floor and before the adapter: a present `trailingStop`, `trailingDelta`, `callbackRate`, or `activationPrice` is refused (`Trailing stop is not supported; the adapter would place a plain spot order` / `Trailing delta is not supported; the adapter would place a plain spot order` / `Callback rate is not supported; the adapter would place a plain spot order` / `Activation price is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not send a trailing callback or activation, so a trailing intent would otherwise be ignored and the order would rest or fill as a plain spot order at price or market. Omitted, null, false, and blank still pass; zero is refused. This is a trailing floor, not a halt, and does not flatten positions. Vitest: `tests/trailing.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

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
