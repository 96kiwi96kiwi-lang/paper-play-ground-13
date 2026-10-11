# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 23 (odd):** Wired the order comment floor into OrderManager. `submit` calls `orderCommentReason` after the link floor and before the adapter: a present `comment`, `orderComment`, or `clientComment` is refused (`Order comment is not supported` / `Order comment alias is not supported` / `Client comment alias is not supported`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order comment. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-comment.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 21 (odd):** Wired the order link floor into OrderManager. `submit` calls `orderLinkReason` after the label floor and before the adapter: a present `clOrdId`, `orderLinkId`, or `linkId` is refused (`Client order id is not supported` / `Order link id is not supported` / `Link id is not supported`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters identify by `clientOrderId` only and do not forward an external link. Omitted, null, false, and blank still pass; zero is refused. This is a retry floor, not a halt, and does not flatten positions. Vitest: `tests/order-link.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 19 (odd):** Wired the order label floor into OrderManager. `submit` calls `orderLabelReason` after the group floor and before the adapter: a present `label`, `orderLabel`, or `clientLabel` is refused (`Order label is not supported` / alias messages) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order label. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-label.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 17 (odd):** Wired the order group floor into OrderManager. `submit` calls `orderGroupReason` after the channel floor and before the adapter: a present `group`, `orderGroup`, or `clientGroup` is refused (`Order group is not supported` / alias messages) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order group. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-group.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 15 (odd):** Wired the order channel floor into OrderManager. `submit` calls `orderChannelReason` after the source floor and before the adapter: a present `channel`, `orderChannel`, or `origin` is refused (`Order channel is not supported` / alias messages) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order channel or origin tag. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-channel.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 13 (odd):** Wired the order source floor into OrderManager. `submit` calls `orderSourceReason` after the remark floor and before the adapter: a present `source`, `orderSource`, or `src` is refused (`Order source is not supported` / alias messages) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order source. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-source.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 11 (odd):** Wired the order remark floor into OrderManager. `submit` calls `orderRemarkReason` after the note floor and before the adapter: a present `remark`, `tag`, or `clientTag` is refused (`Remark is not supported` / alias messages) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not forward a client remark. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-remark.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 9 (odd):** Wired the order note floor into the restored OrderManager. `submit` calls `orderNoteReason` after the priority floor and before the adapter: a present `note`, `orderNote`, or `clientNote` is refused (`Order note is not supported` / alias messages) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not forward a note. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-note.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 7 (odd):** Restored a functional OrderManager (previous commits left `order-manager.ts` as a placeholder). `submit` calls `orderPriorityReason` before the adapter: a present `priority`, `orderPriority`, or `timePriority` is refused (`Order priority is not supported` / alias messages) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set a priority. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-priority.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 5 (odd):** Documented the order priority floor after earlier restore attempts. A submit is refused when `priority`, `orderPriority`, or `timePriority` is present. Paper remains the default.

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
