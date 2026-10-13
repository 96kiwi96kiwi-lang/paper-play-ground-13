# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 8 (odd):** Wired the close-position floor into OrderManager. `submit` calls `closePositionReason` after the grid-id floor and before the adapter: a present `closePosition`, `closeOnTrigger`, or `closeOrder` is refused (`Close position is not supported; the adapter would place a normal spot order` / `Close on trigger is not supported; the adapter would place a normal spot order` / `Close order is not supported; the adapter would place a normal spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not send a close flag, so a close intent would otherwise be ignored and the base amount would still trade as a normal spot order. Omitted, null, false, and blank still pass; zero is refused. This is a close floor, not a halt, and does not flatten positions. Vitest: `tests/close-position.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 7 (odd):** Wired the grid-id floor into OrderManager. `submit` calls `gridIdReason` after the cancel-on-disconnect floor and before the adapter: a present `grid`, `gridId`, or `algoId` is refused (`Grid is not supported; the adapter would place a plain spot order` / `Grid id is not supported; the adapter would place a plain spot order` / `Algo id is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a grid, so a grid intent would otherwise be ignored and the base size would trade. Omitted, null, false, and blank still pass; zero is refused. This is a grid floor, not a halt, and does not flatten positions. Vitest: `tests/grid-id.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 5 (odd):** Wired the cancel-on-disconnect floor into OrderManager. `submit` calls `cancelOnDisconnectReason` after the price-match floor and before the adapter: a present `cancelOnDisconnect`, `deadman`, or `cod` is refused (`Cancel on disconnect is not supported; the adapter would leave a resting order` / `Dead-man switch is not supported; the adapter would leave a resting order` / `COD flag is not supported; the adapter would leave a resting order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not arm a cancel-on-disconnect timer, so a dead-man intent would otherwise be ignored and a resting order could stay live after the process drops. Omitted, null, false, and blank still pass; zero is refused. This is a disconnect floor, not a halt, and does not flatten positions. Vitest: `tests/cancel-on-disconnect.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 3 (odd):** Wired the price-match floor into OrderManager. `submit` calls `priceMatchReason` after the bbo floor and before the adapter: a present `priceMatch`, `pegPriceType`, or `pegOffsetValue` is refused (`Price match is not supported` / `Peg price type is not supported` / `Peg offset is not supported`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order at `price` or as a market and do not peg to the book or apply an offset, so a match or peg intent would otherwise be ignored and the order could rest or fill away from the intended level. Omitted, null, false, and blank still pass; zero is refused. This is a price-match floor, not a halt, and does not flatten positions. Vitest: `tests/price-match.test.ts` (no exchange, no secrets). Default mode is paper.

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
