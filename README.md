# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires explicit configuration and confirmation.

## Current status (Hour 1–2 pushed)

- ✅ Original paper trading UI & strategies kept
- ✅ Risk management (stop-loss, take-profit, daily loss, drawdown, losing streak)
- ✅ New KuCoin adapter (`src/lib/exchange/kucoin.ts`)
- ✅ Paper exchange adapter
- ✅ Strategy engine (Momentum, Mean Reversion, RSI, Grid)
- ✅ Central risk engine
- ✅ Configuration system (`src/config/trading.ts`)
- ✅ `.env.example` for API keys
- ⏳ Live order execution + UI switch (next hours)

## Features

### Paper mode (safe – default)
- Virtual $10 000 USDT
- Prices from CoinGecko
- Strategies: Momentum, Mean Reversion, RSI, Grid
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
This software is provided as-is. Use at your own risk. Never share API keys that have Withdraw permission.

## Development

Built with TanStack Start + React + Tailwind + Recharts.  
Originally generated with Lovable, now extended for real exchange support.
