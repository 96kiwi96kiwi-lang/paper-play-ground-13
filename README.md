# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 81 (odd):** Wired the order-expiry floor into OrderManager. `submit` calls `orderExpiryReason` after the order-tag floor and before the adapter: a present `cancelAfter`, `expireTime`, or `goodTillDate` is refused (`Cancel after is not supported; the adapter would rest the order` / `Expire time is not supported; the adapter would rest the order` / `Good till date is not supported; the adapter would rest the order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not forward cancel-after, expire time, or good-till date, so an expiry intent would otherwise be ignored and the order would rest until a later cancel. Omitted, null, and blank still pass; zero is refused. GTT time-in-force remains its own floor. This is an expiry floor, not a halt, and does not flatten positions. Vitest: `tests/order-expiry.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 79 (odd):** Wired the order-tag floor into OrderManager. `submit` calls `orderTagReason` after the position-idx floor and before the adapter: a present `tag`, `orderTag`, or `clientTag` is refused (`Order tag is not supported; the adapter would place a plain spot order` / `Order tag alias is not supported; the adapter would place a plain spot order` / `Client tag is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order tag, so a tag intent would otherwise be ignored and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-tag.test.ts` (no exchange, no secrets). Default mode is paper.

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
