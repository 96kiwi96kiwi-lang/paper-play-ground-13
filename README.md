# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 153 (odd):** Restored complete OrderManager (prior commit had truncated the file) and wired the assets-alias floor. `submit` calls `assetsAliasReason` after the nav-alias floor and before the adapter: a present `assets`, `orderAssets`, or `baseAssets` is refused (`Assets alias is not supported; the adapter reads amount` / `Order assets alias is not supported; the adapter reads amount` / `Base assets alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read an assets alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is an assets floor, not a halt, and does not flatten positions. Vitest: `tests/assets-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 151 (odd):** Wired the nav-alias floor into OrderManager. `submit` calls `navAliasReason` after the equity-alias floor and before the adapter: a present `nav`, `orderNav`, or `baseNav` is refused (`Nav alias is not supported; the adapter reads amount` / `Order nav alias is not supported; the adapter reads amount` / `Base nav alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a nav alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a nav floor, not a halt, and does not flatten positions. Vitest: `tests/nav-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 149 (odd):** Wired the equity-alias floor into OrderManager. `submit` calls `equityAliasReason` after the portfolio-alias floor and before the adapter: a present `equity`, `orderEquity`, or `baseEquity` is refused (`Equity alias is not supported; the adapter reads amount` / `Order equity alias is not supported; the adapter reads amount` / `Base equity alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read an equity alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is an equity floor, not a halt, and does not flatten positions. Vitest: `tests/equity-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 147 (odd):** Wired the portfolio-alias floor into OrderManager. `submit` calls `portfolioAliasReason` after the positions-alias floor and before the adapter: a present `portfolio`, `orderPortfolio`, or `basePortfolio` is refused (`Portfolio alias is not supported; the adapter reads amount` / `Order portfolio alias is not supported; the adapter reads amount` / `Base portfolio alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a portfolio alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a portfolio floor, not a halt, and does not flatten positions. Vitest: `tests/portfolio-alias.test.ts` (no exchange, no secrets). Default mode is paper.

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
