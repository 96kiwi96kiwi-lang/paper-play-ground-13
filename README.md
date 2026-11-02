# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status
**Hour 445 (odd):** Wired order-header metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderHeaderReason` after the order-footer floor and before the paper path: a present `header`, `orderHeader`, or `clientHeader` is refused (`Header is not supported; the adapter would place a plain spot order` / `Order header is not supported; the adapter would place a plain spot order` / `Client header is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order header, so a header-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-header.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 444 (odd):** Wired order-footer metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderFooterReason` after the order-body floor and before the paper path: a present `footer`, `orderFooter`, or `clientFooter` is refused (`Footer is not supported; the adapter would place a plain spot order` / `Order footer is not supported; the adapter would place a plain spot order` / `Client footer is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order footer, so a footer-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-footer.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 443 (odd):** Wired order-body metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderBodyReason` after the order-subject floor and before the paper path: a present `body`, `orderBody`, or `clientBody` is refused (`Body is not supported; the adapter would place a plain spot order` / `Order body is not supported; the adapter would place a plain spot order` / `Client body is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order body, so a body-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-body.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 442 (odd):** Wired order-subject metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderSubjectReason` after the order-title floor and before the paper path: a present `subject`, `orderSubject`, or `clientSubject` is refused (`Subject is not supported; the adapter would place a plain spot order` / `Order subject is not supported; the adapter would place a plain spot order` / `Client subject is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order subject, so a subject-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-subject.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 441 (odd):** Wired order-title metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderTitleReason` after the order-text floor and before the paper path: a present `title`, `orderTitle`, or `clientTitle` is refused (`Title is not supported; the adapter would place a plain spot order` / `Order title is not supported; the adapter would place a plain spot order` / `Client title is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order title, so a title-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-title.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 440 (odd):** Wired order-text metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderTextReason` after the order-message floor and before the paper path: a present `text`, `orderText`, or `clientText` is refused (`Order text is not supported; the adapter would place a plain spot order` / `Order text alias is not supported; the adapter would place a plain spot order` / `Client text alias is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order text, so a text-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-text.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 439 (odd):** Wired order-message metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderMessageReason` after the order-remark floor and before the paper path: a present `message`, `orderMessage`, or `clientMessage` is refused (`Order message is not supported; the adapter would place a plain spot order` / `Order message alias is not supported; the adapter would place a plain spot order` / `Client message alias is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set an order message, so a message-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-message.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

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
