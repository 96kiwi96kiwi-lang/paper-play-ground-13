# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires explicit configuration and confirmation.

## Current status

| Phase | Status |
|-------|--------|
| Hour 1 – Config + KuCoin adapter | ✅ Done & on GitHub |
| Hour 2 – Strategies + Risk + Paper exchange | ✅ Done & on GitHub |
| Hour 3 – Server API + Bot engine | ✅ Done (this push) |
| Hour 4 – Order management wiring | Next |
| Hour 5 – Risk polish | Pending |
| Hour 6 – UI Paper/Live switch | Pending |
| Hour 7 – Grid improvements | Pending |
| Hour 8 – Docs + checklist | Pending |

## Architecture

```
UI (React dashboard – kept)
        ↓
   Bot engine (strategy + risk)
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
- Full risk engine
- LocalStorage persistence

### Live mode (KuCoin Spot)
- Real orders via CCXT
- Same strategies + risk rules
- API keys only on server side
- Trade permission only (never Withdraw)

## Quick start (Paper)

```bash
npm install
npm run dev
```

## Enabling Live mode (advanced)

1. Create KuCoin API key with **Trade** permission only (disable Withdraw).
2. Copy `.env.example` → `.env` and fill the keys.
3. Set `mode: "live"` in `src/config/trading.ts` only after you understand the risks.
4. Restart the server.

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

## Warning

Trading real cryptocurrency involves substantial risk of loss.  
Use at your own risk. Never share API keys that have Withdraw permission.
