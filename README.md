# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

A limit submit is refused when the price has more than `orders.maxPriceDecimals` decimal places (default 8) (`Price precision`). KuCoin spot rejects a quote finer than the pair price increment before it rests, which would otherwise count as an adapter reject and burn `maxRejectsInWindow`. Trailing zeros do not count. A whole number and an 8-place price still pass. Market submits skip this floor (no resting price is sent). A missing limit price is not this floor. This is a price floor, not a halt, and does not flatten positions. Vitest: `tests/price-precision.test.ts` (no exchange, no secrets).

A submit is refused when the base amount has more than `orders.maxAmountDecimals` decimal places (default 8) (`Amount precision`). KuCoin spot rejects a size finer than the pair base increment before it rests, which would otherwise count as an adapter reject and burn `maxRejectsInWindow`. Trailing zeros do not count. A whole number and an 8-place size still pass. This is a size floor, not a halt, and does not flatten positions. Vitest: `tests/amount-precision.test.ts` (no exchange, no secrets).

See the file history for the full phase table. Default remains paper. Live keys stay on the server. Live mode stays blocked until the operator token is configured and presented.

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).
