# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 115 (odd):** Wired the count-alias floor into OrderManager. `submit` calls `countAliasReason` after the units-alias floor and before the adapter: a present `count`, `orderCount`, or `baseCount` is refused (`Count alias is not supported; the adapter reads amount` / `Order count alias is not supported; the adapter reads amount` / `Base count alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a count alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a count floor, not a halt, and does not flatten positions. Vitest: `tests/count-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 113 (odd):** Wired the units-alias floor into OrderManager. `submit` calls `unitsAliasReason` after the base-qty-alias floor and before the adapter: a present `units`, `orderUnits`, or `baseUnits` is refused (`Units alias is not supported; the adapter reads amount` / `Order units alias is not supported; the adapter reads amount` / `Base units alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a units alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a units floor, not a halt, and does not flatten positions. Vitest: `tests/units-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 111 (odd):** Wired the base-qty-alias floor into OrderManager. `submit` calls `baseQtyAliasReason` after the volume-alias floor and before the adapter: a present `baseQty`, `orderBaseQty`, or `baseBaseQty` is refused (`Base qty alias is not supported; the adapter reads amount` / `Order base qty alias is not supported; the adapter reads amount` / `Base base qty alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a base-qty alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a base-qty floor, not a halt, and does not flatten positions. Vitest: `tests/base-qty-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 109 (odd):** Wired the volume-alias floor into OrderManager. `submit` calls `volumeAliasReason` after the sum-alias floor and before the adapter: a present `volume`, `orderVolume`, or `baseVolume` is refused (`Volume alias is not supported; the adapter reads amount` / `Order volume alias is not supported; the adapter reads amount` / `Base volume alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a volume alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a volume floor, not a halt, and does not flatten positions. Vitest: `tests/volume-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 107 (odd):** Wired the sum-alias floor into OrderManager. `submit` calls `sumAliasReason` after the total-alias floor and before the adapter: a present `sum`, `orderSum`, or `baseSum` is refused (`Sum alias is not supported; the adapter reads amount` / `Order sum alias is not supported; the adapter reads amount` / `Base sum alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a sum alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a sum floor, not a halt, and does not flatten positions. Vitest: `tests/sum-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 105 (odd):** Wired the total-alias floor into OrderManager. `submit` calls `totalAliasReason` after the notional-alias floor and before the adapter: a present `total`, `orderTotal`, or `baseTotal` is refused (`Total alias is not supported; the adapter reads amount` / `Order total alias is not supported; the adapter reads amount` / `Base total alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a total alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a total floor, not a halt, and does not flatten positions. Vitest: `tests/total-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 103 (odd):** Wired the notional-alias floor into OrderManager. `submit` calls `notionalAliasReason` after the cost-alias floor and before the adapter: a present `notional`, `orderNotional`, or `baseNotional` is refused (`Notional alias is not supported; the adapter reads amount` / `Order notional alias is not supported; the adapter reads amount` / `Base notional alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a notional alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a notional floor, not a halt, and does not flatten positions. Vitest: `tests/notional-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 101 (odd):** Wired the cost-alias floor into OrderManager. `submit` calls `costAliasReason` after the value-alias floor and before the adapter: a present `cost`, `orderCost`, or `baseCost` is refused (`Cost alias is not supported; the adapter reads amount` / `Order cost alias is not supported; the adapter reads amount` / `Base cost alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a cost alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a cost floor, not a halt, and does not flatten positions. Vitest: `tests/cost-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 99 (odd):** Wired the value-alias floor into OrderManager. `submit` calls `valueAliasReason` after the amount-alias floor and before the adapter: a present `value`, `orderValue`, or `baseValue` is refused (`Value alias is not supported; the adapter reads amount` / `Order value alias is not supported; the adapter reads amount` / `Base value alias is not supported; the adapter reads amount`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place by `amount` only and do not read a value alias, so an alias intent would otherwise be ignored and the order would use the canonical amount or fail. Omitted, null, and blank still pass; zero is refused. This is a value floor, not a halt, and does not flatten positions. Vitest: `tests/value-alias.test.ts` (no exchange, no secrets). Default mode is paper.

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
