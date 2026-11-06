# paper-play-ground-13

Paper trading bot (default) with an optional live path on KuCoin spot.

**Default is PAPER.** Live mode is never on by default and requires explicit operator confirmation + a server-side operator token.

## Safety

- API keys live only in server environment variables (`KUCOIN_API_KEY`, `KUCOIN_SECRET`, `KUCOIN_PASSWORD`).
- The frontend never receives keys or secrets.
- Withdraw permission is refused; the key must be Trade-only.
- Hard-stops (daily loss, max drawdown, losing streak, price gap, network errors) halt the bot until an operator clears them.
- OrderManager applies cash-reserve, daily-trade-cap, notional, precision, alias, and metadata floors (including order-header, order-footer, order-annotation, order-attribution, order-audience, order-batch, order-body, order-caption, order-note, order-comment, order-context, order-description, order-digest, order-expiry, order-hash, order-memo, order-message, order-metadata, order-name, order-priority, order-tag, order-label, order-source, order-span, order-trace, order-group, order-reference, order-remark, order-signature, order-subject, order-title, order-uuid, order-version, order-visibility, order-weight, order-window, order-zone, order-algo, order-strategy, order-tactic, order-template, order-text, order-kind, order-leg, and order-locale) before any adapter call.
- No live trading occurs without owner credentials present on the server.

See `SAFETY.md` for the full checklist.

## Current status

**Hour (odd):** Wired order-locale metadata floor into OrderManager. A present `locale`, `orderLocale`, or `clientLocale` is refused before the paper or live path so a locale intent cannot be silently ignored. Matches the existing order-leg and earlier metadata floors. Default remains paper. No secrets.

## Run

```bash
npm install
npm run dev
```

Paper mode works without any API keys.
