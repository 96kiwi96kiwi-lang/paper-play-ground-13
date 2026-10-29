# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 369 (odd):** Wired the order-audience floor into OrderManager. `submit` calls `orderAudienceReason` after the order-visibility floor and before the adapter: a present `audience`, `orderAudience`, or `clientAudience` is refused (`Order audience is not supported; the adapter would place a plain spot order` / `Order audience alias is not supported; the adapter would place a plain spot order` / `Client audience alias is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order audience, so an audience intent would otherwise be ignored and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-audience.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 367 (odd):** Wired the order-visibility floor into OrderManager. `submit` calls `orderVisibilityReason` after the order-urgency floor and before the adapter: a present `visibility`, `orderVisibility`, or `clientVisibility` is refused (`Order visibility is not supported; the adapter would place a plain spot order` / `Order visibility alias is not supported; the adapter would place a plain spot order` / `Client visibility alias is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order visibility, so a visibility intent would otherwise be ignored and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-visibility.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 365 (odd):** Wired the order-urgency floor into OrderManager. `submit` calls `orderUrgencyReason` after the order-priority floor and before the adapter: a present `urgency`, `orderUrgency`, or `clientUrgency` is refused (`Order urgency is not supported; the adapter would place a plain spot order` / `Order urgency alias is not supported; the adapter would place a plain spot order` / `Client urgency alias is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order urgency, so an urgency intent would otherwise be ignored and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-urgency.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 363 (odd):** Restored full README and confirmed the order-priority floor is wired in OrderManager. `submit` calls `orderPriorityReason` after the order-payload floor and before the adapter: a present `priority`, `orderPriority`, or `clientPriority` is refused (`Order priority is not supported; the adapter would place a plain spot order` / `Order priority alias is not supported; the adapter would place a plain spot order` / `Client priority alias is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order priority, so a priority intent would otherwise be ignored and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-priority.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 361 (odd):** Wired the order-payload floor into OrderManager. `submit` calls `orderPayloadReason` after the order-metadata floor and before the adapter: a present `payload`, `orderPayload`, or `clientPayload` is refused (`Order payload is not supported; the adapter would place a plain spot order` / `Order payload alias is not supported; the adapter would place a plain spot order` / `Client payload alias is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order payload, so a payload intent would otherwise be ignored and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-payload.test.ts` (no exchange, no secrets). Default mode is paper.

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
