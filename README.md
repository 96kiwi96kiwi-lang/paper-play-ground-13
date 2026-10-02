# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

A buy is refused when the mark (`markPrice`, else limit `price`) is at least `orders.maxChaseUpPct` (default 2%) above the latest accepted buy fill on that symbol and that fill is still inside `orders.chaseUpWindowMs` (default 15 minutes) (`Chase up`). Rejects and cancels do not count. Fills older than the window, other symbols, and submits with no positive mark still pass. Grid scale-in is downward, so this floor does not block a lower rung. Sells still pass so a stop or take-profit is not blocked. This is a chase floor, not a halt, and does not flatten positions. Vitest: `tests/chase-up.test.ts` (no exchange, no secrets).

A buy that adds to a symbol already held is refused when the mark (`markPrice`, else limit `price`) is at least `orders.maxAverageDownPct` (default 3%) under that symbol's open average entry (`Average down`). Flat names still open. Sells still pass so a stop or take-profit is not blocked. A submit with no positive mark skips this floor. This is an add floor, not a halt, and does not flatten positions. Vitest: `tests/average-down.test.ts` (no exchange, no secrets).

A buy on a symbol is refused for `orders.lossReentryCooldownMs` (default 20 minutes) after the latest accepted sell whose fill was at least `orders.lossReentryMinLossPct` (default 1%) under the average entry still open on that symbol's local seen book (`Loss reentry`). Cost basis is rebuilt from accepted fills (filled size, else amount; price, else cost/size). Rejects and cancels do not count. A scratch or a profitable exit does not start the timer. Other symbols are unaffected. Sells still pass so an exit is not blocked. This is a re-entry floor, not a halt, and does not flatten positions. Vitest: `tests/loss-reentry.test.ts` (no exchange, no secrets).

A buy that would open a **new symbol** is refused when held inventory plus working buys already use `risk.maxOpenPositions` slots (default 3) (`Open slots`). The count is taken from the OrderManager book, not only from the caller `openPositionsCount` snapshot, so a resting buy on a name that has not filled yet still occupies a slot. Dust amounts, sells, rejects, and cancels do not. Adding to a name that already has a slot still passes this floor, and sells are never blocked by it. This is not a halt and does not flatten positions. Vitest: `tests/open-slots.test.ts` (no exchange, no secrets).

A buy is refused when that symbol already has `orders.maxConsecutiveBuysPerSymbol` (default 4) trailing accepted buys on the local seen book with no accepted sell between them (`Consecutive buys`). Rejects and cancels do not count. Other symbols keep their own streak. An accepted sell resets the pair so a later add can pass. The default sits above `grid.maxStackedBuys` (3) so a normal grid ladder still fits, and one more add is blocked until an exit. This is a ladder floor, not a halt, and does not flatten positions. Vitest: `tests/consecutive-buys.test.ts` (no exchange, no secrets).

Hour 1–8 plus hardening are in place. OrderManager refuses market submits without `quotedAt` or when quote age exceeds `orders.maxPriceAgeMs` (default 90s). Per-symbol `maxPositionPct` still applies on buys when price is known. Buys that would leave **available cash** (book cash minus remaining notional on working buys) below `risk.minCashReserveUsd` (default $500) are refused — that is not a halt. Sells that would spend **available inventory** (book size minus remaining size on working sells for that symbol) are refused the same way (`Inventory`). Dust leftover is measured against that available size. Same last-reject / health path as the other submit floors. These floors are **not** hard-stops and contain no secrets. Vitest: `tests/inventory-reserve.test.ts`.

See the file history for the full phase table. Default remains paper. Live keys stay on the server. Live mode stays blocked until the operator token is configured and presented.

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).
