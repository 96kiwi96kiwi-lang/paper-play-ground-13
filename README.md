# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

Hour 1–8 plus hardening are in place. OrderManager refuses market submits without `quotedAt` or when quote age exceeds `orders.maxPriceAgeMs` (default 90s). Per-symbol `maxPositionPct` still applies on buys when price is known. Buys that would leave **available cash** (book cash minus remaining notional on working buys) below `risk.minCashReserveUsd` (default $500) are refused — that is not a halt. Sells that would spend **available inventory** (book size minus remaining size on working sells for that symbol) are refused the same way (`Inventory`). Dust leftover is measured against that available size. Same last-reject / health path as the other submit floors. These floors are **not** hard-stops and contain no secrets. Vitest: `tests/inventory-reserve.test.ts`.

Buys whose accepted buy notional on the **current UTC day** (local seen book: filled / closed / working buys; rejects and cancels ignored) plus this order would exceed `orders.maxDailyBuyNotionalUsd` (default $4,000) are refused (`Daily buy notional`). The same book is then checked **per symbol** against `orders.maxDailyBuyNotionalPerSymbolUsd` (default $1,800) so one pair cannot consume the whole daily spend. Sells and other symbols do not count toward a pair's cap. Unknown-notional buys are refused only when that cap is already booked. These are daily spend floors, not a halt. Vitest: `tests/daily-buy-notional.test.ts` (no exchange, no secrets).

A non-empty `clientOrderId` that already exists on the local seen-order book is refused (`Duplicate clientOrderId`). Blank or omitted ids still go through. This is a retry floor only — it does not talk to the exchange and contains no secrets. Vitest: `tests/client-order-id.test.ts`.

Sells that would leave a leftover position whose notional is below `orders.minOrderNotionalUsd` are refused at OrderManager (`Sell dust`). `executeBotTick` still flattens that crumb into the same sell when the full held notional is inside the min/max band, so the strategy path does not leave unsellable inventory. Direct / adapter submits that skip the tick path hit the refuse floor instead. Vitest covers the selector in `tests/sell-dust.test.ts` (no exchange, no secrets).

Opposite-side submits on the **same symbol** are refused for `orders.symbolFlipCooldownMs` (default 90s) after the last accepted order on that book. Same-side adds are allowed. Rejected and canceled rows do not start the timer. This is a churn floor, not a halt. Grid still has its own `minHoldMs`. Vitest: `tests/symbol-flip.test.ts` (no exchange, no secrets).

`cancelStaleOpenOrders` uses `orders.staleOpenOrderMs` (default 15m): working limit / open / partial orders older than that window are canceled through the adapter. Market fills are ignored. Positions are not flattened. `executeBotTick` now runs that sweep **before** strategy submit, including hold ticks, so resting limits do not sit forever waiting for a later manual call. Vitest covers the selector and cancel path in `tests/stale-open-orders.test.ts` (no exchange, no secrets).

On hard-stop, paper no longer skips flatten. `flattenOpenOrdersOnHalt` marks **all** persisted working orders canceled on disk (`cancelAllWorkingSeenOrdersOnDisk`) and OrderManager exposes `cancelAllWorkingOrders` for in-process books. Fresh limits are included; closed market fills and positions are not touched. Live still uses KuCoin cancel-all when credentials exist. Vitest: `tests/halt-cancel-working.test.ts` (no exchange, no secrets).

Unconfirmed grid rung reservations older than `grid.reservationTtlMs` (default 2m) are rolled back on every `executeBotTick` as well as inside `gridStrategy` / hydrate — hold and non-grid ticks included — so a hung submit cannot leave `stackedBuys` latched. Confirmed fills (`reserved=false`) stay. Vitest covers the TTL path in `tests/grid-reservation-ttl.test.ts` (no exchange, no secrets).

`applyHardStops` still latches daily-loss, max-drawdown, losing-streak, network-error, and price-gap halts. Each `currentPrice` tick now writes `riskState.lastPrices[symbol]` so a later jump ≥ `PRICE_GAP_LIMIT` (3.5%) can actually fire. The gapped mark is stored too, so `clearHalt` does not instantly re-halt on the same print. `evaluateRisk` refuses after a halt and also refuses at `risk.maxDailyTrades` **without** setting `haltReason`. Vitest covers those floors in `tests/risk-hard-stops.test.ts` (no exchange, no secrets).

A file lease at `data/worker-lease.json` elects one process as the trading worker (TTL 90s, steal on expiry). A second process logs standby and **cannot submit** — `createServerOrderManager` renews the lease and refuses with `Standby worker cannot submit` when another live owner holds it. Optional `WORKER_ID` / `WORKER_LEASE_PATH` / `WORKER_LEASE_TTL_MS` — no secrets. Health includes `workerWatch` (holder, age, this process maySubmit).

Set `PAPER_SERVER_LOOP=1` to run an opt-in **paper-only** server housekeeping loop (interval = `botTickMs`). It records a heartbeat, expires stale grid reservations, and marks persisted working orders older than `orders.staleOpenOrderMs` as canceled on disk. It does **not** invent quotes, call KuCoin, or place live orders. Health includes `paperLoop` (`enabled`, `running`, `reason`, `lastStaleCanceled`). Off by default so a dashboard-owned tick is unchanged until you opt in. Vitest: `tests/paper-loop.test.ts`.

A root `Dockerfile` builds the production Node server for hosts that require a Dockerfile (e.g. Railway paper-hourly-worker). The image does not contain secrets and starts in paper. Mount a persistent volume at `/app/data` so the worker lease and `bot-state.json` survive restarts. Live keys, if ever used, stay in the host environment — never in the image.

**Operator auth:** `OPERATOR_TOKEN` must be set in the server environment before live can be enabled or a halt can be cleared. A public `confirmed: true` flag is not enough. Mode status reports `operatorAuthConfigured` (boolean only). The token is never returned in health or mode payloads. Leave the env unset to keep live and halt-clear fail-closed. Vitest: `tests/operator-auth.test.ts` and `tests/trading-mode.test.ts` (fixture string only, no real secret).

See the file history for the full phase table. Default remains paper. Live keys stay on the server. Live mode stays blocked until the operator token is configured and presented.

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).
