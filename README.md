# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

| Phase | Status |
|-------|--------|
| Hour 1 – Config + KuCoin adapter | ✅ Done |
| Hour 2 – Strategies + Risk + Paper exchange | ✅ Done |
| Hour 3 – Server API + Bot engine | ✅ Done |
| Hour 4 – Order management wiring | ✅ Done |
| Hour 5 – Risk polish | ✅ Done |
| Hour 6 – UI Paper/Live switch | ✅ Done |
| Hour 7 – Grid improvements | ✅ Done |
| Hour 8 – Docs + persist + alerts | ✅ Done |
| Hardening – paper portfolio file persist | ✅ Done |
| Hardening – Trade-only key audit (no Withdraw) | ✅ Done |
| Hardening – clientOrderId ledger persist | ✅ Done |
| Hardening – incremental fills + open-order sync | ✅ Done |
| Hardening – stale open-order TTL cancel | ✅ Done |
| Hardening – tick heartbeat + stalled-loop watchdog | ✅ Done |
| Hardening – daily trade cap (UTC, persisted) | ✅ Done |
| Hardening – min submit interval (burst guard) | ✅ Done |
| Hardening – max concurrent open orders | ✅ Done |
| Hardening – per-symbol open cap + max notional | ✅ Done |
| Hardening – pair allowlist + max gross exposure | ✅ Done |
| Hardening – multi-level grid + last-fill guard | ✅ Done |
| Hardening – persist grid mid + last-fill | ✅ Done |
| Hardening – persist lastSubmitAt (burst guard) | ✅ Done |
| Hardening – grid anti-whipsaw + lastFillPrice persist | ✅ Done (this push) |

## Architecture

```
UI (React dashboard)
        ↓
   Bot engine (strategy + risk)
        ↓
   OrderManager (idempotent clientOrderId)
        ↓
ExchangeAdapter
   ① PaperExchange   (CoinGecko + virtual money)
   ② KuCoin (CCXT)   (real orders – live only, keys stay on server)

Persist: data/bot-state.json (risk snapshot + last hard-stop + paper portfolio + seen orders + lastHeartbeat + tradesToday + gridBooks + lastSubmitAt)
Alerts:  console + optional HARD_STOP_WEBHOOK_URL
Live gate: inspectKucoinKeyPermissions() — Withdraw on the key blocks LIVE
Watchdog: lastHeartbeat older than 3× botTickMs → health.ok=false + alert
```

## Paper mode — quick start

1. `npm install`
2. Copy `.env.example` → `.env` if you want (keys not required for paper).
3. `npm run dev`
4. Leave the dashboard in Paper. Virtual balance starts at $10 000 USDT.
5. Prices come from CoinGecko. No exchange orders are sent.

Dashboard LocalStorage is UI convenience only. Risk / halt snapshots, the paper cash+positions book, the last ~200 clientOrderIds, the last bot heartbeat, grid mid/last-fill books (including lastFillPrice / lastFillAt), and the last accepted submit timestamp are written under `data/bot-state.json` so a restart does not wipe the last halt reason, reset virtual inventory, allow a retry to double-submit the same intent, re-fire the same grid rung, skip the min-submit burst guard, or flip grid side before the anti-whipsaw hold expires.

Use `createServerOrderManager(adapter)` on the server so those persist hooks are wired automatically.

## Live mode — steps

1. Finish the checklist in [SAFETY.md](./SAFETY.md).
2. On KuCoin, create an API key with **Trade only**. Disable Withdraw. Prefer IP allowlists.
3. Put `KUCOIN_API_KEY`, `KUCOIN_SECRET`, and `KUCOIN_PASSWORD` in server `.env` (never in client code).
4. Restart the server so env vars load. Confirm health shows `hasCredentials: true` and does **not** echo secrets.
5. In the dashboard, open the Paper/Live switch, type `ENABLE LIVE`, confirm.
6. The server audits key permissions. If Withdraw is present, or the audit cannot run, live stays paper.
7. Expect a red **LIVE MODE** banner. Watch the first session live.
8. To leave live: switch back to Paper or stop the process. A restart always returns to paper.

API keys are never sent to the frontend. Live placement goes through `assertLiveAllowed()` on the server.

If the permission endpoint is unavailable after you have manually verified Trade-only, you may set `KUCOIN_ALLOW_UNVERIFIED_KEY=1`. Do not use that flag with a Withdraw-capable key.

## Hard-stop monitoring

Daily loss, max drawdown, losing streak, price gap (≥ 3.5%), and network-error streak (5) set `haltReason` and refuse new orders until an operator clears the halt.

On first halt:
- `[ALERT][HARD-STOP]` is written to server logs
- `data/bot-state.json` records `lastHardStop`
- If `HARD_STOP_WEBHOOK_URL` is set, a JSON POST is attempted
- In live mode, visible open orders are canceled (positions are not market-dumped)

The daily trade cap (default 12 accepted submits per UTC day) is **not** a hard-stop. It only refuses further `submit` calls until the next UTC day. The counter is persisted so a restart cannot reset the cap.

## Heartbeat watchdog

Call `markBotTick` / `markBotTickFn` after each engine tick. Health then reports `lastTickAt` and `heartbeatStale`.

If no tick is recorded for `TRADING_CONFIG.orders.staleHeartbeatMs` (default 135s = 3× `botTickMs`):
- `getHealth().ok` becomes false
- a `stale_heartbeat` alert is emitted (rate-limited to one per window)
- the dashboard Paper/Live cluster shows "Watchdog: no tick for Ns"

This does **not** dump positions. It tells you the loop died.

## Order lifecycle

`OrderManager.submit` then `syncOpenOrders` / `cancelStaleOpenOrders`:
- create → pair allowlist → risk validate → submit with clientOrderId
- refuse symbols outside `TRADING_CONFIG.pairs` (BTC/ETH/SOL/BNB vs USDT)
- refuse a new submit if local working orders already ≥ `maxConcurrentOpenOrders` (4)
- refuse a new submit if working orders on that symbol already ≥ `maxOpenOrdersPerSymbol` (2)
- refuse when `amount * price` exceeds `maxOrderNotionalUsd` (2500) if a price is present
- refuse a **buy** when booked cost basis + this order notional would exceed `maxGrossExposureUsd` (8000)
- refuse a new submit if the last *accepted* one was within `minSubmitIntervalMs` (8s)
- that last-submit clock is persisted (`lastSubmitAt`) so a crash + immediate restart cannot burst two accepts
- track status via `fetchOrder` / `fetchOpenOrders`
- apply **only the new fill delta** to the local book (no double-count after restart)
- resting open/limit orders older than `TRADING_CONFIG.orders.staleOpenOrderMs` (15 min) are canceled
- same interface for Paper and KuCoin

## Risk rules (shared paper + live)

| Rule                    | Value   |
|-------------------------|---------|
| Trade size              | 15 %    |
| Max position per coin   | 20 %    |
| Stop-loss               | –4 %    |
| Take-profit             | +6 %    |
| Daily loss limit        | –10 %   |
| Max drawdown            | –18 %   |
| Max open positions      | 3       |
| Losing streak hard stop | 4       |
| Price gap hard stop     | 3.5 %   |
| Network error streak    | 5       |
| Daily trade cap         | 12 / UTC day |
| Stale open-order TTL    | 15 min  |
| Stale heartbeat         | 135 s   |
| Min submit interval     | 8 s     |
| Max concurrent open orders | 4    |
| Max open orders per symbol | 2    |
| Max order notional      | 2500 USD |
| Max gross exposure      | 8000 USD |
| Allowed pairs           | BTC/ETH/SOL/BNB USDT |

## Grid (Hour 7+)

- Even percent spacing around a mid price (`TRADING_CONFIG.grid`)
- Spacing is floored at `takerFeePct * 2 * minNetEdgeMultiplier` so levels stay fee-aware
- Signals use the **nearest crossed level** (±L across `levels/2`), not only the first rung
- Same side+level is not re-fired until price walks to another rung (last-fill guard)
- Flipping buy↔sell waits `minHoldMs` (3 min) and `minLevelsBeforeFlip` (2 rungs) to cut whipsaws
- Sells that would not cover round-trip fees are skipped (uses position avg or lastFillPrice)
- Book recenters when price drifts ≥ `rebalanceThresholdPct` from mid (clears last-fill)
- Mid + last-fill (side, level, price, time) are written to `data/bot-state.json` on each `markBotTick` and restored on boot so a restart does not re-seed and double-buy the same level or skip the hold clock

## Warning

Trading real cryptocurrency involves substantial risk of loss.
Use at your own risk. Never share API keys that have Withdraw permission.
