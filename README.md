# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

Hour 1–8 plus hardening are in place. OrderManager refuses market submits without `quotedAt` or when quote age exceeds `orders.maxPriceAgeMs` (default 90s). Per-symbol `maxPositionPct` still applies on buys when price is known. Buys that would leave **book cash** (OrderManager snapshot, not only `riskState.cash`) below `risk.minCashReserveUsd` (default $500) are refused — that is not a halt. Same last-reject / health path as the other submit floors. These floors are **not** hard-stops and contain no secrets.

`cancelStaleOpenOrders` now uses `orders.staleOpenOrderMs` (default 15m): working limit / open / partial orders older than that window are canceled through the adapter. Market fills are ignored. Positions are not flattened. Vitest covers the selector and cancel path in `tests/stale-open-orders.test.ts` (no exchange, no secrets).

`applyHardStops` still latches daily-loss, max-drawdown, losing-streak, network-error, and price-gap halts. `evaluateRisk` refuses after a halt and also refuses at `risk.maxDailyTrades` **without** setting `haltReason`. Vitest covers those floors in `tests/risk-hard-stops.test.ts` (no exchange, no secrets).

A file lease at `data/worker-lease.json` elects one process as the trading worker (TTL 90s, steal on expiry). A second process logs standby and **cannot submit** — `createServerOrderManager` renews the lease and refuses with `Standby worker cannot submit` when another live owner holds it. Optional `WORKER_ID` / `WORKER_LEASE_PATH` / `WORKER_LEASE_TTL_MS` — no secrets. Health includes `workerWatch` (holder, age, this process maySubmit).

See the file history for the full phase table. Default remains paper. Live keys stay on the server. Live mode stays blocked until authenticated operator authorization exists.

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, and the worker lease.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).
