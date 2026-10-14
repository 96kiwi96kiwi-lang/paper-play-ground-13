# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 43 (odd):** Wired the quote-quantity floor into OrderManager. `submit` calls `quoteQtyReason` after the trailing floor and before the adapter: a present `quoteQty`, `quoteOrderQty`, or `notional` is refused (`Quote quantity is not supported; the adapter would place a base-amount order` / `Quote order quantity is not supported; the adapter would place a base-amount order` / `Notional is not supported; the adapter would place a base-amount order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order using the base amount and do not interpret a quote size, so a quote-quantity intent would otherwise be ignored and the base amount would trade. Omitted, null, false, and blank still pass; zero is refused. This is a quote-quantity floor, not a halt, and does not flatten positions. Vitest: `tests/quote-qty.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 41 (odd):** Wired the trailing-stop floor into OrderManager. `submit` calls `trailingReason` after the stop-price floor and before the adapter: a present `trailingStop`, `trailingDelta`, `callbackRate`, or `activationPrice` is refused (`Trailing stop is not supported; the adapter would place a plain spot order` / `Trailing delta is not supported; the adapter would place a plain spot order` / `Callback rate is not supported; the adapter would place a plain spot order` / `Activation price is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not send a trailing callback or activation, so a trailing intent would otherwise be ignored and the order would rest or fill as a plain spot order at price or market. Omitted, null, false, and blank still pass; zero is refused. This is a trailing floor, not a halt, and does not flatten positions. Vitest: `tests/trailing.test.ts` (no exchange, no secrets). Default mode is paper.

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
