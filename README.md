# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

Hour 1–8 plus hardening are in place. OrderManager refuses market submits without `quotedAt` or when quote age exceeds `orders.maxPriceAgeMs` (default 90s). Per-symbol `maxPositionPct` still applies on buys when price is known. Buys that would leave **book cash** (OrderManager snapshot, not only `riskState.cash`) below `risk.minCashReserveUsd` (default $500) are refused — that is not a halt. Same last-reject / health path as the other submit floors. These floors are **not** hard-stops and contain no secrets.

Sells that would leave a leftover position whose notional is below `orders.minOrderNotionalUsd` are refused at OrderManager (`Sell dust`). `executeBotTick` still flattens that crumb into the same sell when the full held notional is inside the min/max band, so the strategy path does not leave unsellable inventory. Direct / adapter submits that skip the tick path hit the refuse floor instead. Vitest covers the selector in `tests/sell-dust.test.ts` (no exchange, no secrets).

`cancelStaleOpenOrders` uses `orders.staleOpenOrderMs` (default 15m): working limit / open / partial orders older than that window are canceled through the adapter. Market fills are ignored. Positions are not flattened. `executeBotTick` now runs that sweep **before** strategy submit, including hold ticks, so resting limits do not sit forever waiting for a later manual call. Vitest covers the selector and cancel path in `tests/stale-open-orders.test.ts` (no exchange, no secrets).

Unconfirmed grid rung reservations older than `grid.reservationTtlMs` (default 2m) are rolled back on every `executeBotTick` as well as inside `gridStrategy` / hydrate — hold and non-grid ticks included — so a hung submit cannot leave `stackedBuys` latched. Confirmed fills (`reserved=false`) stay. Vitest covers the TTL path in `tests/grid-reservation-ttl.test.ts` (no exchange, no secrets).

`applyHardStops` still latches daily-loss, max-drawdown, losing-streak, network-error, and price-gap halts. Each `currentPrice` tick now writes `riskState.lastPrices[symbol]` so a later jump ≥ `PRICE_GAP_LIMIT` (3.5%) can actually fire. The gapped mark is stored too, so `clearHalt` does not instantly re-halt on the same print. `evaluateRisk` refuses after a halt and also refuses at `risk.maxDailyTrades` **without** setting `haltReason`. Vitest covers those floors in `tests/risk-hard-stops.test.ts` (no exchange, no secrets).

A file lease at `data/worker-lease.json` elects one process as the trading worker (TTL 90s, steal on expiry). A second process logs standby and **cannot submit** — `createServerOrderManager` renews the lease and refuses with `Standby worker cannot submit` when another live owner holds it. Optional `WORKER_ID` / `WORKER_LEASE_PATH` / `WORKER_LEASE_TTL_MS` — no secrets. Health includes `workerWatch` (holder, age, this process maySubmit).

A root `Dockerfile` builds the production Node server for hosts that require a Dockerfile (e.g. Railway paper-hourly-worker). The image does not contain secrets and starts in paper. Mount a persistent volume at `/app/data` so the worker lease and `bot-state.json` survive restarts. Live keys, if ever used, stay in the host environment — never in the image.

See the file history for the full phase table. Default remains paper. Live keys stay on the server. Live mode stays blocked until authenticated operator authorization exists.

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, and the worker lease.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).
