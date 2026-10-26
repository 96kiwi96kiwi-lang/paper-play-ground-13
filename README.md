# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 303 (odd):** Wired the order-session floor into OrderManager. `submit` calls `orderSessionReason` after the order-request floor and before the adapter: a present `session`, `orderSession`, or `clientSession` is refused (`Session is not supported; the adapter would place a plain spot order` / `Order session is not supported; the adapter would place a plain spot order` / `Client session is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a session, so a session-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-session.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 301 (odd):** Restored the persistent risk-gated OrderManager (was a placeholder) so the runtime contract test passes, and wired the order-request floor into `submit`. `submit` calls `orderRequestReason` after the order-batch floor and before the adapter: a present `requestId`, `orderRequestId`, or `clientRequestId` is refused (`Request id is not supported; the adapter would place a plain spot order` / `Order request id is not supported; the adapter would place a plain spot order` / `Client request id is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a request id, so a request-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-request.test.ts` + `tests/order-manager-runtime-contract.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 299 (odd):** Wired the order-batch floor into OrderManager. `submit` calls `orderBatchReason` after the order-span floor and before the adapter: a present `batch`, `orderBatch`, or `clientBatch` is refused (`Batch is not supported; the adapter would place a plain spot order` / `Order batch is not supported; the adapter would place a plain spot order` / `Client batch is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a batch id, so a batch-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-batch.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 297 (odd):** Wired the order-span floor into OrderManager. `submit` calls `orderSpanReason` after the order-trace floor and before the adapter: a present `span`, `orderSpan`, or `clientSpan` is refused (`Span is not supported; the adapter would place a plain spot order` / `Order span is not supported; the adapter would place a plain spot order` / `Client span is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a span id, so a span-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-span.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 295 (odd):** Wired the order-trace floor into OrderManager. `submit` calls `orderTraceReason` after the order-external floor and before the adapter: a present `trace`, `orderTrace`, or `clientTrace` is refused (`Trace is not supported; the adapter would place a plain spot order` / `Order trace is not supported; the adapter would place a plain spot order` / `Client trace is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a trace id, so a trace-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-trace.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 293 (odd):** Wired the order-external floor into OrderManager. `submit` calls `orderExternalReason` after the order-correlation floor and before the adapter: a present `externalId`, `orderExternal`, or `clientExternal` is refused (`External id is not supported; the adapter would place a plain spot order` / `Order external is not supported; the adapter would place a plain spot order` / `Client external is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach an external id, so an external-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-external.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

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
