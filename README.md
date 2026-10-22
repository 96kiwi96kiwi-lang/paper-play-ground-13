# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 223 (odd):** Wired the order-tag floor into OrderManager. `submit` calls `orderTagReason` after the order-expiry floor and before the adapter: a present `tag`, `orderTag`, or `clientTag` is refused (`Order tag is not supported; the adapter would place a plain spot order` / `Order tag alias is not supported; the adapter would place a plain spot order` / `Client tag is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order tag, so a tag intent would otherwise be ignored and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-tag.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 221 (odd):** Wired the order-expiry floor into OrderManager. `submit` calls `orderExpiryReason` after the cancel-replace floor and before the adapter: a present `cancelAfter`, `expireTime`, or `goodTillDate` is refused (`Cancel after is not supported; the adapter would rest the order` / `Expire time is not supported; the adapter would rest the order` / `Good till date is not supported; the adapter would rest the order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not forward cancel-after, expire time, or good-till date, so an expiry intent would otherwise be ignored and the order would rest until a later cancel. Omitted, null, and blank still pass; zero is refused. This is an expiry floor, not a halt, and does not flatten positions. GTT time-in-force remains its own floor. Vitest: `tests/order-expiry.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 219 (odd):** Wired the cancel-replace floor into OrderManager. `submit` calls `cancelReplaceReason` after the trailing floor and before the adapter: a present `cancelReplace`, `cancelOrderId`, or `orderIdToCancel` is refused (`Cancel-replace is not supported; the adapter would place a new order and leave the old one resting` / `Cancel order id is not supported; the adapter would place a new order and leave the old one resting` / `Order id to cancel is not supported; the adapter would place a new order and leave the old one resting`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not cancel a named resting order, so a replace intent would otherwise leave both the old and new orders resting. Omitted, null, false, and blank still pass; zero is refused. This is a replace floor, not a halt, and does not flatten positions. Vitest: `tests/cancel-replace.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

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
