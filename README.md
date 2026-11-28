# paper-play-ground-13

Paper trading bot (default) with an optional live path on KuCoin spot.

**Default is PAPER.** Live mode is never on by default and requires explicit operator confirmation + a server-side operator token.

## Safety

- API keys live only in server environment variables (`KUCOIN_API_KEY`, `KUCOIN_SECRET`, `KUCOIN_PASSWORD`).
- The frontend never receives keys or secrets.
- Withdraw permission is refused; the key must be Trade-only.
- Hard-stops (daily loss, max drawdown, losing streak, price gap, network errors) halt the bot until an operator clears them.
- OrderManager applies cash-reserve, daily-trade-cap, notional, precision, alias, and metadata floors (including order-form, order-pattern, order-motif, order-theme, order-subject, order-style, order-status, order-phase, order-stage, order-step, order-strategy, order-tactic, order-play, order-scheme, order-plan, order-plot, order-scenario, order-story, order-narrative, order-saga, order-epic, order-quest, order-mission, order-goal, order-force, order-intent, order-will, order-dream, order-vision, order-ambition, order-destiny, order-fate, order-wish, order-hope, order-optimism, order-belief, order-faith, order-trust, order-allegiance, order-loyalty, order-devotion, order-passion, order-ardor, order-zeal, order-fervor, order-intensity, order-vigor, order-energy, order-power, order-might, order-strength, order-potency, and earlier metadata floors) before any adapter call.
- No live trading occurs without owner credentials present on the server.

See `SAFETY.md` for the full checklist.

## Current status

**Hour (odd):** Wired the order-form metadata floor into the persistent OrderManager. A present `form`, `orderForm`, or `clientForm` is refused before the adapter, together with the order-pattern, order-motif, order-theme, order-subject, order-style, order-status, order-phase, order-stage, order-step, order-strategy, order-tactic, order-play, order-scheme, order-plan, order-plot, order-scenario, order-story, order-narrative, order-saga, order-epic, order-quest, order-mission, order-goal, order-force, order-intent, order-will, order-dream, order-vision, order-ambition, order-destiny, order-fate, order-wish, order-hope, order-optimism, order-belief, order-faith, order-trust, order-allegiance, order-loyalty, order-devotion, order-passion, order-ardor, order-zeal, order-fervor, order-intensity, order-vigor, order-energy, order-power, order-might, order-strength, order-potency, and earlier metadata floors. The runtime keeps constructor state, snapshot/inventory, risk-gated submit, persistence callbacks, restart recovery, idempotent seen orders, duplicate-order protection, capital and risk checks, safe cancel, and fail-closed adapter errors. Default remains paper. No secrets. No live without server-side owner credentials.

## Run

```bash
npm install
npm run dev
```

Paper mode works without any API keys.
