# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 17 (odd):** A submit is refused when `group`, `orderGroup`, or `clientGroup` is present (`Order group is not supported` / `Order group alias is not supported` / `Client group alias is not supported`). Paper and KuCoin adapters place one plain spot order and do not set an order group, so a group intent would be ignored and the base size would rest or fill as a plain spot order. Omitted, null, false, and blank still pass. Zero is present and is refused. `OrderManager.submit` calls `orderGroupReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-group.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 8 (odd):** A submit is refused when `label`, `orderLabel`, or `clientLabel` is present (`Order label is not supported` / `Order label alias is not supported` / `Client label alias is not supported`). Paper and KuCoin adapters place one plain spot order and do not set an order label, so a label intent would be ignored and the base size would rest or fill as a plain spot order. Omitted, null, false, and blank still pass. Zero is present and is refused. `OrderManager.submit` calls `orderLabelReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-label.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 7 (odd):** A submit is refused when `channel`, `orderChannel`, or `origin` is present (`Order channel is not supported` / `Order channel alias is not supported` / `Origin alias is not supported`). Paper and KuCoin adapters place one plain spot order and do not set an order channel or origin tag, so a channel intent would be ignored and the base size would rest or fill as a plain spot order. Omitted, null, false, and blank still pass. Zero is present and is refused. `OrderManager.submit` calls `orderChannelReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-channel.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 6 (odd):** A submit is refused when `source`, `orderSource`, or `src` is present (`Order source is not supported` / `Order source alias is not supported` / `Source alias is not supported`). Paper and KuCoin adapters place one plain spot order and do not set an order source or partner tag, so a source intent would be ignored and the base size would rest or fill as a plain spot order. Omitted, null, false, and blank still pass. Zero is present and is refused. `OrderManager.submit` calls `orderSourceReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-source.test.ts` (no exchange, no secrets). Default mode is paper.

A submit is refused when `isMargin`, `margin`, or `is_margin` is present (`Is-margin is not supported` / `Margin flag is not supported` / `Is-margin alias is not supported`). Paper and KuCoin adapters place one plain spot order and do not open a margin account, so a margin intent would be ignored and the base size would trade on cash. Omitted, null, false, and blank still pass. Zero is present and is refused. `leverage`, `marginMode`, and `tdMode` remain the leverage-mode floor. `OrderManager.submit` calls `isMarginReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a margin floor, not a halt, and does not flatten positions. Vitest: `tests/is-margin.test.ts` (no exchange, no secrets).

A submit is refused when `tpTriggerBy`, `slTriggerBy`, or `triggerPxType` is present (`Take-profit trigger source is not supported` / `Stop-loss trigger source is not supported` / `Trigger price type is not supported`). Paper and KuCoin adapters place one plain spot order and do not price a bracket off last, mark, or index, so a mark or index stop would be ignored and the base size would rest or fill immediately. Omitted, null, false, and blank still pass. Zero is present and is refused. `tpTriggerPx`, `slTriggerPx`, and `tpslTriggerPx` remain the trigger-price floor. `OrderManager.submit` calls `tpslTriggerByReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a TP/SL trigger-source floor, not a halt, and does not flatten positions. Vitest: `tests/tpsl-trigger-by.test.ts` (no exchange, no secrets).

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
