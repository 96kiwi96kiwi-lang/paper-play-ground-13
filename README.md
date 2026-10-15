# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 59 (odd):** Wired the client-id alias floor into OrderManager. `submit` calls `clientIdAliasReason` after the order-type alias floor and before the adapter: a present `clientOid`, `newClientOrderId`, or `origClientOrderId` is refused (`Client oid is not supported; the adapter identifies by clientOrderId` / `New client order id is not supported; the adapter identifies by clientOrderId` / `Orig client order id is not supported; the adapter identifies by clientOrderId`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters identify by `clientOrderId` only and do not forward a clientOid or newClientOrderId, so an alias would otherwise be ignored and a retry would not be idempotent (could double-place). Omitted, null, and blank still pass; zero is refused. This is a retry floor, not a halt, and does not flatten positions. Vitest: `tests/client-id-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 57 (odd):** Wired the order-type alias floor into OrderManager. `submit` calls `orderTypeAliasReason` after the validate-only floor and before the adapter: a present `ordType`, `orderType`, or `order_type` is refused (`Ord type is not supported; the adapter reads type` / `Order type alias is not supported; the adapter reads type` / `Order type snake alias is not supported; the adapter reads type`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters read only `type` and default an omitted type to market, so a limit alias would otherwise be ignored and the base size would trade as a market. Omitted, null, and blank still pass; zero is refused. This is a type floor, not a halt, and does not flatten positions. Vitest: `tests/order-type-alias.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 55 (odd):** Wired the validate-only floor into OrderManager. `submit` calls `validateOnlyReason` after the side-effect floor and before the adapter: a present `test`, `dryRun`, or `validateOnly` is refused (`Test order is not supported; the adapter would place a real spot order` / `Dry run is not supported; the adapter would place a real spot order` / `Validate only is not supported; the adapter would place a real spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not honor a test, dry-run, or validate-only flag, so a rehearsal intent would otherwise be ignored and the base size would rest or fill for real. Omitted, null, false, and blank still pass; zero is refused. This is a rehearsal floor, not a halt, and does not flatten positions. Vitest: `tests/validate-only.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 51 (odd):** Wired the side-effect floor into OrderManager. `submit` calls `sideEffectReason` after the recv-window floor and before the adapter: a present `sideEffectType`, `sideEffect`, or `marginEffect` is refused (`Side effect type is not supported; the adapter would place a spot order` / `Side effect is not supported; the adapter would place a spot order` / `Margin effect is not supported; the adapter would place a spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not send a margin side-effect, so MARGIN_BUY, AUTO_REPAY, or AUTO_BORROW_REPAY would otherwise be ignored and the base size would trade on the spot book. Omitted, null, false, and blank still pass; zero and NO_SIDE_EFFECT are refused. This is a margin floor, not a halt, and does not flatten positions. Vitest: `tests/side-effect.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 49 (odd):** Wired the funds floor into OrderManager. `submit` calls `fundsReason` after the quote-quantity floor and before the TP/SL trigger-source floor: a present `funds`, `quoteFunds`, or `fundsAmount` is refused (`Funds is not supported; the adapter would place a base-amount order` / `Quote funds is not supported; the adapter would place a base-amount order` / `Funds amount is not supported; the adapter would place a base-amount order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order using the base amount and do not interpret a quote funds value (KuCoin market buys often use "funds"), so a funds intent would otherwise be ignored and the base amount would trade. Omitted, null, false, and blank still pass; zero is refused. This is a funds floor, not a halt, and does not flatten positions. Vitest: `tests/funds.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 47 (odd):** Wired the recv-window floor into OrderManager. `submit` calls `recvWindowReason` after the TP/SL trigger-source floor and before the adapter: a present `recvWindow` is refused (`Recv window is not supported; the adapter would place without a client deadline`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not honor a client deadline, so a recvWindow intent would otherwise be ignored and the base size would rest or fill immediately. Omitted, null, false, and blank still pass; zero is refused. This is a recv-window floor, not a halt, and does not flatten positions. Vitest: `tests/recv-window.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 45 (odd):** Wired the TP/SL trigger-source floor into OrderManager. `submit` calls `tpslTriggerByReason` after the quote-quantity floor and before the adapter: a present `tpTriggerBy`, `slTriggerBy`, or `triggerPxType` is refused (`Take-profit trigger source is not supported; the adapter would place a plain spot order` / `Stop-loss trigger source is not supported; the adapter would place a plain spot order` / `Trigger price type is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not price a take-profit or stop-loss off last, mark, or index, so a mark or index stop intent would otherwise be ignored and the base size would rest or fill immediately. Omitted, null, false, and blank still pass; zero is refused. This is a TP/SL trigger-source floor, not a halt, and does not flatten positions. Vitest: `tests/tpsl-trigger-by.test.ts` (no exchange, no secrets). Default mode is paper.

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
