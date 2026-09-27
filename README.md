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
| Hardening – grid anti-whipsaw + lastFillPrice persist | ✅ Done |
| Hardening – persist lastHardStop + health/UI halt | ✅ Done |
| Hardening – atomic bot-state write + lastHardStop code | ✅ Done |
| Hardening – restore halt + risk counters on server submit | ✅ Done |
| Hardening – grid stacked-buy cap + reservation rollback | ✅ Done |
| Hardening – expire unconfirmed grid reservations (TTL) | ✅ Done |
| Hardening – grid inventory reconcile (stackedBuys vs position) | ✅ Done |
| Hardening – operator clear-halt (persist + health) | ✅ Done |
| Hardening – drop remapped lastLevel when rebalance walks off-book | ✅ Done |
| Hardening – normalize lastLevel on hydrate + spacing rebuild | ✅ Done |
| Hardening – no-short inventory guard on sells | ✅ Done |
| Hardening – persist recent hard-stop alerts | ✅ Done (this push) |

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

Persist: data/bot-state.json (atomic tmp+rename; risk snapshot + last hard-stop code + paper portfolio + seen orders + lastHeartbeat + tradesToday + gridBooks + lastSubmitAt + recentAlerts)
Alerts:  console + optional HARD_STOP_WEBHOOK_URL
Live gate: inspectKucoinKeyPermissions() — Withdraw on the key blocks LIVE
Watchdog: lastHeartbeat older than 3× botTickMs → health.ok=false + alert
Health: lastHardStop + haltReason + last 10 recentAlerts survive restart and show on the Paper/Live cluster
Submit: createServerOrderManager applies persisted halt/counters before every order
Clear:  clearOperatorHalt() stamps lastHardStop.clearedAt so a restart does not restore the halt
```

See SAFETY.md. Default remains paper. Live keys stay server-side.
