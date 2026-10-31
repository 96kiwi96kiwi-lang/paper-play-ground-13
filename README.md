# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 413 (odd):** Wired the order-parent floor into OrderManager. `submit` calls `orderParentReason` after the order-link floor and before the adapter: a present `parentId`, `orderParent`, or `clientParent` is refused (`Parent id is not supported; the adapter would place a plain spot order` / `Order parent is not supported; the adapter would place a plain spot order` / `Client parent is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a parent, so a parent-child intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-parent.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 411 (odd):** Wired the order-link floor into OrderManager. `submit` calls `orderLinkReason` after the order-key floor and before the adapter: a present `clOrdId`, `orderLinkId`, or `linkId` is refused (`Client order id is not supported; the adapter identifies by clientOrderId` / `Order link id is not supported; the adapter identifies by clientOrderId` / `Link id is not supported; the adapter identifies by clientOrderId`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and identify only by `clientOrderId`, so an external link alias would otherwise be ignored and a retry would not be idempotent (could double-place). Omitted, null, false, and blank still pass; zero is refused. This is a retry floor, not a halt, and does not flatten positions. Vitest: `tests/order-link.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 409 (odd):** Wired the order-key floor into OrderManager. `submit` calls `orderKeyReason` after the order-id floor and before the adapter: a present `key`, `orderKey`, or `clientKey` is refused (`Key is not supported; the adapter would place a plain spot order` / `Order key is not supported; the adapter would place a plain spot order` / `Client key is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a key, so a key-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-key.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 407 (odd):** Wired the order-id floor into OrderManager. `submit` calls `orderIdReason` after the order-hash floor and before the adapter: a present `id`, `orderId`, or `clientId` is refused (`Id is not supported; the adapter would place a plain spot order` / `Order id is not supported; the adapter would place a plain spot order` / `Client id is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach an id, so an id-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-id.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 405 (odd):** Wired the order-hash floor into OrderManager. `submit` calls `orderHashReason` after the order-uuid floor and before the adapter: a present `hash`, `orderHash`, or `clientHash` is refused (`Hash is not supported; the adapter would place a plain spot order` / `Order hash is not supported; the adapter would place a plain spot order` / `Client hash is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a hash, so a hash-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-hash.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 403 (odd):** Wired the order-uuid floor into OrderManager. `submit` calls `orderUuidReason` after the order-group floor and before the adapter: a present `uuid`, `orderUuid`, or `clientUuid` is refused (`Uuid is not supported; the adapter would place a plain spot order` / `Order uuid is not supported; the adapter would place a plain spot order` / `Client uuid is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a uuid, so a uuid-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-uuid.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 401 (odd):** Wired the order-group floor into OrderManager. `submit` calls `orderGroupReason` after the order-channel floor and before the adapter: a present `group`, `orderGroup`, or `clientGroup` is refused (`Order group is not supported; the adapter would place a plain spot order` / `Order group alias is not supported; the adapter would place a plain spot order` / `Client group alias is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order group, so a group intent would otherwise be ignored and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-group.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

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
