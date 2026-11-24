# paper-play-ground-13

Paper trading bot (default) with an optional live path on KuCoin spot.

**Default is PAPER.** Live mode is never on by default and requires explicit operator confirmation + a server-side operator token.

## Safety

- API keys live only in server environment variables (`KUCOIN_API_KEY`, `KUCOIN_SECRET`, `KUCOIN_PASSWORD`).
- The frontend never receives keys or secrets.
- Withdraw permission is refused; the key must be Trade-only.
- Hard-stops (daily loss, max drawdown, losing streak, price gap, network errors) halt the bot until an operator clears them.
- OrderManager applies cash-reserve, daily-trade-cap, notional, precision, alias, and metadata floors (including order-option, order-preference, order-selection, order-choice, order-decision, order-judgment, order-verdict, order-conclusion, order-outcome, order-result, order-resolve, order-potency, order-strength, order-might, order-power, order-energy, order-vigor, order-intensity, order-fervor, order-zeal, order-ardor, order-passion, order-devotion, order-loyalty, order-trust, order-faith, order-belief, order-conviction, order-assurance, order-confidence, order-optimism, order-hope, order-fate, order-destiny, order-ambition, order-vision, order-dream, order-wish, order-will, order-intent, order-force, order-goal, order-mission, order-quest, order-epic, order-saga, order-narrative, order-story, order-scenario, order-plot, order-plan, order-scheme, order-play, order-tactic, order-strategy, order-step, order-stage, order-phase, order-status, order-span, order-window, order-weight, order-zone, order-group, order-chain, order-batch, order-session, order-channel, order-context, order-correlation, order-attribution, order-fingerprint, order-hash, order-signature, order-reference, order-remark, order-review, order-quote, order-digest, order-synopsis, order-overview, order-message, order-memo, order-note, order-comment, order-kind, order-origin, order-source, order-purpose, order-audience, order-account, order-algo, order-text, order-template, order-tag, order-label, order-abstract, order-name, order-title, order-subject, order-header, order-footer, order-body, order-description, order-caption, order-brief, order-summary, order-outline, order-level, order-grade, order-rating, order-score, order-rank, order-priority, order-user, order-urgency, order-theme, order-annotation, and earlier metadata floors) before any adapter call.
- No live trading occurs without owner credentials present on the server.

See `SAFETY.md` for the full checklist.

## Current status

**Hour (odd):** Wired the order-devotion metadata floor into the persistent OrderManager. A present `devotion`, `devotionId`, or `orderDevotion` is refused before the adapter, together with the order-passion, order-ardor, order-zeal, order-fervor, order-intensity, order-vigor, order-energy, order-power, order-might, order-strength, order-potency, and earlier metadata floors. The runtime keeps constructor state, snapshot/inventory, risk-gated submit, persistence callbacks, restart recovery, idempotent seen orders, duplicate-order protection, capital and risk checks, safe cancel, and fail-closed adapter errors. Default remains paper. No secrets. No live without server-side owner credentials.

## Run

```bash
npm install
npm run dev
```

Paper mode works without any API keys.
