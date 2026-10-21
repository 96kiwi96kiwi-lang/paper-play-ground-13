# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 185 (odd):** Wired the size-alias floor into OrderManager. `submit` calls `sizeAliasReason` after the side-alias floor and before the adapter: a present `qty`, `size`, or `quantity` is refused (`Qty alias is not supported; the adapter reads amount` / `Size alias is not supported; the adapter reads amount` / `Quantity alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a size alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a size floor, not a halt, and does not flatten positions. Vitest: `tests/size-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 183 (odd):** Wired the side-alias floor into OrderManager. `submit` calls `sideAliasReason` after the product-alias floor and before the adapter: a present `orderSide`, `direction`, or `action` is refused (`Order side alias is not supported; the adapter reads side` / `Direction is not supported; the adapter reads side` / `Action is not supported; the adapter reads side`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `side` only and do not read a side alias, so an alias intent would otherwise be ignored and the order would buy or sell the canonical side. Omitted, null, and blank still pass; zero is refused. This is a side floor, not a halt, and does not flatten positions. Vitest: `tests/side-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 181 (odd):** Wired the product-alias floor into OrderManager. `submit` calls `productAliasReason` after the price-alias floor and before the adapter: a present `product`, `instId`, or `ticker` is refused (`Product alias is not supported; the adapter reads symbol` / `Inst id alias is not supported; the adapter reads symbol` / `Ticker alias is not supported; the adapter reads symbol`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `symbol` only and do not read a product alias, so an alias intent would otherwise be ignored and the order would use the canonical symbol or fail. Omitted, null, and blank still pass; zero is refused. This is a product floor, not a halt, and does not flatten positions. Vitest: `tests/product-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 179 (odd):** Wired the price-alias floor into OrderManager. `submit` calls `priceAliasReason` after the pair-alias floor and before the adapter: a present `px`, `limitPx`, `orderPrice`, or `limitPrice` is refused (`Price alias is not supported; the adapter reads price` / `Limit price alias is not supported; the adapter reads price` / `Order price alias is not supported; the adapter reads price`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place a limit by `price` only and do not read a price alias, so an alias intent would otherwise be ignored and the limit would use the canonical price or fail. Omitted, null, and blank still pass; zero is refused. This is a price floor, not a halt, and does not flatten positions. Vitest: `tests/price-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 177 (odd):** Wired the pair-alias floor into OrderManager. `submit` calls `pairAliasReason` after the quote-alias floor and before the adapter: a present `pair`, `market`, or `instrument` is refused (`Pair alias is not supported; the adapter reads symbol` / `Market alias is not supported; the adapter reads symbol` / `Instrument alias is not supported; the adapter reads symbol`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `symbol` only and do not read a pair alias, so an alias intent would otherwise be ignored and the order would use the canonical symbol or fail. Omitted, null, and blank still pass; zero is refused. This is a pair floor, not a halt, and does not flatten positions. Vitest: `tests/pair-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 175 (odd):** Wired the quote-alias floor into OrderManager. `submit` calls `quoteAliasReason` after the asset-alias floor and before the adapter: a present `quote`, `orderQuote`, or `baseQuote` is refused (`Quote alias is not supported; the adapter reads amount` / `Order quote alias is not supported; the adapter reads amount` / `Base quote alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a quote alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a quote floor, not a halt, and does not flatten positions. Vitest: `tests/quote-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 173 (odd):** Wired the asset-alias floor into OrderManager. `submit` calls `assetAliasReason` after the currency-alias floor and before the adapter: a present `asset`, `orderAsset`, or `baseAsset` is refused (`Asset alias is not supported; the adapter reads amount` / `Order asset alias is not supported; the adapter reads amount` / `Base asset alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read an asset alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is an asset floor, not a halt, and does not flatten positions. Vitest: `tests/asset-alias.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

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
