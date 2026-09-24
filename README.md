# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys and explicit confirmation. After every process restart the bot boots in paper again.

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
| Hour 8 – Docs + persist + alerts | ✅ Done (this push) |

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

Persist: data/bot-state.json (risk snapshot + last hard-stop)
Alerts:  console + optional HARD_STOP_WEBHOOK_URL
```

## Paper mode — quick start

1. `npm install`
2. Copy `.env.example` → `.env` if you want (keys not required for paper).
3. `npm run dev`
4. Leave the dashboard in Paper. Virtual balance starts at $10 000 USDT.
5. Prices come from CoinGecko. No exchange orders are sent.

Dashboard LocalStorage is UI convenience only. Risk / halt snapshots are also written under `data/bot-state.json` on the server so a restart does not wipe the last halt reason.

## Live mode — steps

1. Finish the checklist in [SAFETY.md](./SAFETY.md).
2. On KuCoin, create an API key with **Trade only**. Disable Withdraw. Prefer IP allowlists.
3. Put `KUCOIN_API_KEY`, `KUCOIN_SECRET`, and `KUCOIN_PASSWORD` in server `.env` (never in client code).
4. Restart the server so env vars load. Confirm health shows `hasCredentials: true` and does **not** echo secrets.
5. In the dashboard, open the Paper/Live switch, type `ENABLE LIVE`, confirm.
6. Expect a red **LIVE MODE** banner. Watch the first session live.
7. To leave live: switch back to Paper or stop the process. A restart always returns to paper.

API keys are never sent to the frontend. Live placement goes through `assertLiveAllowed()` on the server.

## Hard-stop monitoring

Daily loss, max drawdown, losing streak, price gap (≥ 3.5%), and network-error streak (5) set `haltReason` and refuse new orders until an operator clears the halt.

On first halt:
- `[ALERT][HARD-STOP]` is written to server logs
- `data/bot-state.json` records `lastHardStop`
- If `HARD_STOP_WEBHOOK_URL` is set, a JSON POST is attempted

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

## Grid (Hour 7)

- Even percent spacing around a mid price (`TRADING_CONFIG.grid`)
- Spacing is floored at `takerFeePct * 2 * minNetEdgeMultiplier` so levels stay fee-aware
- Sells that would not cover round-trip fees are skipped
- Book recenters when price drifts ≥ `rebalanceThresholdPct` from mid

## Warning

Trading real cryptocurrency involves substantial risk of loss.
Use at your own risk. Never share API keys that have Withdraw permission.
