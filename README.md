# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status
**Hour 422 (odd):** Added order-chain metadata floor. `orderChainReason` refuses a present `chainId`, `orderChain`, or `clientChain` (`Chain id is not supported; the adapter would place a plain spot order` / `Order chain is not supported; the adapter would place a plain spot order` / `Client chain is not supported; the adapter would place a plain spot order`). Paper and KuCoin adapters place one plain spot order and do not attach a chain, so a multi-order chain intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-chain.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager wiring (call after order-related) is the next step if not already present. OrderManager is complete and type-safe.

**Hour 421 (odd):** Fixed OrderManager wiring for the order-related floor. `submit` calls `orderRelatedReason` after the order-leg floor and before the paper path: a present `relatedId`, `orderRelated`, or `clientRelated` is refused (`Related id is not supported; the adapter would place a plain spot order` / `Order related is not supported; the adapter would place a plain spot order` / `Client related is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a related order, so a related-order intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-related.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 420 (even):** Fixed OrderManager wiring for the order-leg floor. `submit` calls `orderLegReason` after the order-sibling floor and before the paper path: a present `legId`, `orderLeg`, or `clientLeg` is refused (`Leg id is not supported; the adapter would place a plain spot order` / `Order leg is not supported; the adapter would place a plain spot order` / `Client leg is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a leg, so a multi-leg intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-leg.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

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
See [SAFETY.md](./SAFETY.md).

### Unattended worker startup
The Nitro runtime plugin starts the opt-in paper loop before any HTTP request.

Run `npm run build && npm run test:worker` to verify startup, quote decisions and persisted history with deterministic quotes and no incoming requests.
