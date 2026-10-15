# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 67 (odd):** Wired the account-route floor into OrderManager. `submit` calls `accountRouteReason` after the category floor and before the adapter: a present `accountType`, `account`, or `fundsAccount` is refused (`Account type is not supported; the adapter places on the spot trade account` / `Account is not supported; the adapter places on the spot trade account` / `Funds account is not supported; the adapter places on the spot trade account`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order on the spot trade account only and do not route by account type, so a margin or main-account intent would otherwise be ignored and the base size would trade on the spot trade account. Omitted, null, and blank still pass; zero is refused. This is an account floor, not a halt, and does not flatten positions. Vitest: `tests/account-route.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 65 (odd):** Restored the full OrderManager (previous wiring commits had left a placeholder or incomplete file) and confirmed the category floor is wired. `submit` calls `categoryReason` after the open-offset floor and before the adapter. A present non-spot `category`, `productType`, or `instType` is refused so a linear, inverse, swap, or margin label cannot be silently ignored. Spot and cash pass. Does not burn `maxRejectsInWindow`. Not a halt. Default remains paper. No secrets.

**Hour 63 (odd):** Wired the category floor into OrderManager. `submit` calls `categoryReason` after the open-offset floor and before the adapter: a present `category`, `productType`, or `instType` that is not spot or cash is refused (`Category is not supported; the adapter would place a spot order` / `Product type is not supported; the adapter would place a spot order` / `Instrument type is not supported; the adapter would place a spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not read a product category, so a linear, inverse, swap, or margin label would otherwise be ignored and the base size would trade on the spot book. Spot and cash (any case) pass; omitted, null, false, and blank pass; zero is refused. This is a product floor, not a halt, and does not flatten positions. Vitest: `tests/category.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 61 (odd):** Wired the open-offset floor into OrderManager. `submit` calls `openOffsetReason` after the client-id alias floor and before the adapter: a present `openClose`, `posOffset`, or `closeFraction` is refused (`Open/close offset is not supported; the adapter would place a spot order` / `Position offset is not supported; the adapter would place a spot order` / `Close fraction is not supported; the adapter would place a spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not send an open or close offset, so a close intent would otherwise be ignored and the base amount would still trade on the spot book. Omitted, null, false, and blank still pass; zero is refused. `closePosition` remains its own floor. This is an open/close offset floor, not a halt, and does not flatten positions. Vitest: `tests/open-offset.test.ts` (no exchange, no secrets). Default mode is paper.

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
