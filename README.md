# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires explicit configuration and confirmation.

## Current status

| Phase | Status |
|-------|--------|
| Hour 1 – Config + KuCoin adapter | ✅ Done |
| Hour 2 – Strategies + Risk + Paper exchange | ✅ Done |
| Hour 3 – Server API + Bot engine | ✅ Done |
| Hour 4 – Order management wiring | ✅ Done |
| Hour 5 – Risk polish | ✅ Done |
| Hour 6 – UI Paper/Live switch | ✅ Done |
| Hour 7 – Grid improvements | ✅ Done (this push) |
| Hour 8 – Docs + checklist | Next |

## Architecture

```
UI (React dashboard – kept)
        ↓
   Bot engine (strategy + risk)
        ↓
   OrderManager (idempotent clientOrderId)
        ↓
ExchangeAdapter
   ① PaperExchange   (CoinGecko + virtual money)
   ② KuCoin (CCXT)   (real orders – live only)
```

## Features

### Paper mode (safe – default)
- Virtual $10 000 USDT
- Prices from CoinGecko
- Strategies: Momentum, Mean Reversion, RSI, **Grid**
- Full risk engine with hard-stops
- LocalStorage persistence

### Live mode (KuCoin Spot)
- Real orders via CCXT
- Same strategies + risk rules
- API keys only on server side
- Trade permission only (never Withdraw)
- Dashboard toggle requires typing `ENABLE LIVE` and server credentials
- Red LIVE MODE banner when active

### Risk hard-stops (Hour 5)
Daily loss limit, max drawdown, and losing streak **halt the bot** (`haltReason` stays set until an operator clears it). Price gaps ≥ 3.5% and a streak of 5 network errors also hard-stop. Partial fills update portfolio by filled qty only. Decisions are logged with ALLOW / BLOCK / HARD-STOP.

### Grid (Hour 7)
- Even percent spacing around a mid price (`TRADING_CONFIG.grid`)
- Spacing is floored at `takerFeePct * 2 * minNetEdgeMultiplier` so levels stay fee-aware
- Sells that would not cover round-trip fees are skipped
- Book recenters when price drifts ≥ `rebalanceThresholdPct` from mid

## Quick start (Paper)

```bash
npm install
npm run dev
```

## Enabling Live mode (advanced)

1. Create KuCoin API key with **Trade** permission only (disable Withdraw).
2. Copy `.env.example` → `.env` and fill the keys on the **server** only.
3. Use the dashboard Paper/Live switch and type `ENABLE LIVE`.
4. Never put API keys in frontend code or localStorage.

## Risk rules (shared)

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

## Warning

Trading real cryptocurrency involves substantial risk of loss.  
Use at your own risk. Never share API keys that have Withdraw permission.
