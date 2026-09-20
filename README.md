# Crypto Trader Sim

Build an algorithmic paper trading simulator with the following features:



Core functionality:



	•	Dashboard showing portfolio value, profit/loss, and trade history

	•	Real-time crypto price fetching (BTC, ETH, SOL, BNB) via CoinGecko public API (no key needed)

	•	Automated trading bot that runs every 60 seconds and makes buy/sell decisions automatically

	•	Starting virtual balance: $10,000 USDT



Trading strategy (implement all three, user can switch):



	•	Momentum – buy when price rises >2% in last 5 minutes, sell when drops >1.5%

	•	Mean Reversion – buy when price drops >3% below 1h average, sell when returns to average

	•	RSI Strategy – buy when RSI < 30 (oversold), sell when RSI > 70 (overbought)



UI:



	•	Clean dark dashboard (like a trading terminal)

	•	Live price chart for selected coin (last 30 data points)

	•	Active positions table with unrealized P&L

	•	Trade log with timestamp, action, price, amount

	•	Bot status indicator (running/stopped) with Start/Stop button

	•	Strategy selector dropdown

	•	Total return % shown prominently



Tech:



	•	React + Tailwind

	•	Recharts for price charts

	•	All data from CoinGecko free API

	•	No backend needed, everything in browser state

	•	Auto-refresh prices every 30 seconds



Important: This is a paper trading simulator with virtual money only. No real money involved.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://paper-play-ground-13.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6690ad01-981f-46bd-8668-25663b1facf0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
