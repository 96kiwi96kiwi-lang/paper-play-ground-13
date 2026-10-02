# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

A buy that adds to a symbol already held is refused when the mark (`markPrice`, else limit `price`) is at least `orders.maxAverageDownPct` (default 3%) under that symbol's open average entry (`Average down`). Flat names still open. Sells still pass so a stop or take-profit is not blocked. A submit with no positive mark skips this floor. This is an add floor, not a halt, and does not flatten positions. Vitest: `tests/average-down.test.ts` (no exchange, no secrets).

A buy on a symbol is refused for `orders.lossReentryCooldownMs` (default 20 minutes) after the latest accepted sell whose fill was at least `orders.lossReentryMinLossPct` (default 1%) under the average entry still open on that symbol's local seen book (`Loss reentry`). Cost basis is rebuilt from accepted fills (filled size, else amount; price, else cost/size). Rejects and cancels do not count. A scratch or a profitable exit does not start the timer. Other symbols are unaffected. Sells still pass so an exit is not blocked. This is a re-entry floor, not a halt, and does not flatten positions. Vitest: `tests/loss-reentry.test.ts` (no exchange, no secrets).

See the file history for the rest of the Hour 1–8 floors (open slots, consecutive buys, cash reserve, working and daily and hourly notionals, trade caps, flip and same-side cooldowns, reject burst, limit band, stale orders, halt cancel, grid TTL, worker lease, paper loop, operator auth). Default remains paper. Live keys stay on the server. Live mode stays blocked until the operator token is configured and presented.

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).
