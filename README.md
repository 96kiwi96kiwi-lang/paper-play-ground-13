# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 269 (odd):** Wired the working-type floor into OrderManager. `submit` calls `workingTypeReason` after the order-position floor and before the adapter: a present `workingType`, `stopWorkingType`, or `triggerBy` is refused (`Working type is not supported; the adapter would place without a mark or last trigger` / `Stop working type is not supported; the adapter would place without a mark or last trigger` / `Trigger by is not supported; the adapter would place without a mark or last trigger`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not select a mark, index, or last trigger, so a working-type intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a trigger-source floor, not a halt, and does not flatten positions. Vitest: `tests/working-type.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 267 (odd):** Wired the order-position floor into OrderManager. `submit` calls `orderPositionReason` after the order-account floor and before the adapter: a present `position`, `orderPosition`, or `clientPosition` is refused (`Position is not supported; the adapter would place a plain spot order` / `Order position is not supported; the adapter would place a plain spot order` / `Client position is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a position or order position, so a position intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-position.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 265 (odd):** Wired the order-account floor into OrderManager. `submit` calls `orderAccountReason` after the order-session floor and before the adapter: a present `account`, `orderAccount`, or `clientAccount` is refused (`Account is not supported; the adapter would place a plain spot order` / `Order account is not supported; the adapter would place a plain spot order` / `Client account is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach an account or order account, so an account intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-account.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

*(Earlier hours continue the same pattern of wiring floors. Full history is in git.)*

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default.
Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`.
A process restart always returns to paper.

Never invent or commit secrets.
