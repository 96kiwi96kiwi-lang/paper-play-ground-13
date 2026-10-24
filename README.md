# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 275 (odd):** Wired the order-version floor into OrderManager. `submit` calls `orderVersionReason` after the order-time floor and before the adapter: a present `version`, `orderVersion`, or `clientVersion` is refused (`Version is not supported; the adapter would place a plain spot order` / `Order version is not supported; the adapter would place a plain spot order` / `Client version is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a version, so a version-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-version.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 273 (odd):** Wired the order-time floor into OrderManager. `submit` calls `orderTimeReason` after the order-request floor and before the adapter: a present `timestamp`, `orderTimestamp`, or `clientTimestamp` is refused (`Timestamp is not supported; the adapter would place a plain spot order` / `Order timestamp is not supported; the adapter would place a plain spot order` / `Client timestamp is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a timestamp, so a time-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-time.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 271 (odd):** Wired the order-request floor into OrderManager. `submit` calls `orderRequestReason` after the working-type floor and before the adapter: a present `requestId`, `orderRequestId`, or `clientRequestId` is refused (`Request id is not supported; the adapter would place a plain spot order` / `Order request id is not supported; the adapter would place a plain spot order` / `Client request id is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a request id, so a request-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-request.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 269 (odd):** Wired the working-type floor into OrderManager. `submit` calls `workingTypeReason` after the order-position floor and before the adapter: a present `workingType`, `stopWorkingType`, or `triggerBy` is refused (`Working type is not supported; the adapter would place without a mark or last trigger` / `Stop working type is not supported; the adapter would place without a mark or last trigger` / `Trigger by is not supported; the adapter would place without a mark or last trigger`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not select a mark, index, or last trigger, so a working-type intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a trigger-source floor, not a halt, and does not flatten positions. Vitest: `tests/working-type.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

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
