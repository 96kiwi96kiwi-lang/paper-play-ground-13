# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

Hour 1–8 plus hardening are in place. OrderManager refuses market submits without `quotedAt` or when quote age exceeds `orders.maxPriceAgeMs` (default 90s). Per-symbol `maxPositionPct` still applies on buys when price is known. Buys that would leave cash below `risk.minCashReserveUsd` (default $500) are refused — that is not a halt. Same last-reject / health path as the other submit floors. These floors are **not** hard-stops and contain no secrets.

See the file history for the full phase table. Default remains paper. Live keys stay on the server.

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, and working-order slots.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).
