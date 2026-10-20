# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 175 (odd):** Wired the quote-alias floor into OrderManager. `submit` calls `quoteAliasReason` after the asset-alias floor and before the adapter: a present `quote`, `orderQuote`, or `baseQuote` is refused (`Quote alias is not supported; the adapter reads amount` / `Order quote alias is not supported; the adapter reads amount` / `Base quote alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a quote alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a quote floor, not a halt, and does not flatten positions. Vitest: `tests/quote-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 173 (odd):** Wired the asset-alias floor into OrderManager. `submit` calls `assetAliasReason` after the currency-alias floor and before the adapter: a present `asset`, `orderAsset`, or `baseAsset` is refused (`Asset alias is not supported; the adapter reads amount` / `Order asset alias is not supported; the adapter reads amount` / `Base asset alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read an asset alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is an asset floor, not a halt, and does not flatten positions. Vitest: `tests/asset-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 171 (odd):** Wired the currency-alias floor into OrderManager. `submit` calls `currencyAliasReason` after the crypto-alias floor and before the adapter: a present `currency`, `orderCurrency`, or `baseCurrency` is refused (`Currency alias is not supported; the adapter reads amount` / `Order currency alias is not supported; the adapter reads amount` / `Base currency alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a currency alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a currency floor, not a halt, and does not flatten positions. Vitest: `tests/currency-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

(See the repository history for the complete list of floors, architecture, and prior status paragraphs. Default remains paper. Live keys stay on the server.)

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).

### Unattended worker startup
The Nitro runtime plugin starts the opt-in paper loop before any HTTP request.
Run `npm run build && npm run test:worker` to verify startup, quote decisions and persisted history with deterministic quotes and no incoming requests.
A Railway worker still requires a persistent volume at `/app/data`; build success alone does not prove production persistence.
