# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 137 (odd):** Wired the items-alias floor into OrderManager. `submit` calls `itemsAliasReason` after the coins-alias floor and before the adapter: a present `items`, `orderItems`, or `baseItems` is refused (`Items alias is not supported; the adapter reads amount` / `Order items alias is not supported; the adapter reads amount` / `Base items alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read an items alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is an items floor, not a halt, and does not flatten positions. Vitest: `tests/items-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 135 (odd):** Wired the coins-alias floor into OrderManager. `submit` calls `coinsAliasReason` after the tokens-alias floor and before the adapter: a present `coins`, `orderCoins`, or `baseCoins` is refused (`Coins alias is not supported; the adapter reads amount` / `Order coins alias is not supported; the adapter reads amount` / `Base coins alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a coins alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a coins floor, not a halt, and does not flatten positions. Vitest: `tests/coins-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 133 (odd):** Restored the complete OrderManager runtime (previous wire had truncated the class) and confirmed the tokens-alias floor is wired into `submit` after the pieces-alias floor and before the adapter. A present `tokens`, `orderTokens`, or `baseTokens` is refused (`Tokens alias is not supported; the adapter reads amount` / `Order tokens alias is not supported; the adapter reads amount` / `Base tokens alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a tokens alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a tokens floor, not a halt, and does not flatten positions. Vitest: `tests/tokens-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 131 (odd):** Wired the tokens-alias floor into OrderManager. `submit` calls `tokensAliasReason` after the pieces-alias floor and before the adapter: a present `tokens`, `orderTokens`, or `baseTokens` is refused (`Tokens alias is not supported; the adapter reads amount` / `Order tokens alias is not supported; the adapter reads amount` / `Base tokens alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a tokens alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a tokens floor, not a halt, and does not flatten positions. Vitest: `tests/tokens-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 129 (odd):** Wired the pieces-alias floor into OrderManager. `submit` calls `piecesAliasReason` after the contracts-alias floor and before the adapter: a present `pieces`, `orderPieces`, or `basePieces` is refused (`Pieces alias is not supported; the adapter reads amount` / `Order pieces alias is not supported; the adapter reads amount` / `Base pieces alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a pieces alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a pieces floor, not a halt, and does not flatten positions. Vitest: `tests/pieces-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 127 (odd):** Wired the contracts-alias floor into OrderManager. `submit` calls `contractsAliasReason` after the size-alias floor and before the adapter: a present `contracts`, `orderContracts`, or `baseContracts` is refused (`Contracts alias is not supported; the adapter reads amount` / `Order contracts alias is not supported; the adapter reads amount` / `Base contracts alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a contracts alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a contracts floor, not a halt, and does not flatten positions. Vitest: `tests/contracts-alias.test.ts` (no exchange, no secrets). Default mode is paper.

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
