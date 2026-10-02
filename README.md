# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

A limit submit is refused when a same-side working order (open / partial / pending) already rests on that symbol within `orders.samePriceBandPct` (default 0.15%) of the new price (`Same price`). A grid retry cannot stack a second buy or sell on the same rung. An adjacent rung still passes: the band sits under `grid.spacingPct` (0.8%). Market submits skip this floor (no resting price). Opposite side, other symbols, and closed / rejected / canceled rows do not count. Set `orders.blockSamePriceWorking` to false to skip it. This is a resting-book floor, not a halt, and does not flatten positions. Vitest: `tests/same-price.test.ts` (no exchange, no secrets).

A submit is refused when an opposite-side working order (open / partial / pending) already rests on the same symbol (`Self-cross`). A buy cannot sit against a working sell, and a sell cannot sit against a working buy, so the book does not cross itself. Same-side adds still pass this floor. Other symbols, and closed / rejected / canceled rows, do not count. Set `orders.blockOppositeWorking` to false to skip it. This is a resting-book floor, not a halt, and does not flatten positions. Vitest: `tests/self-cross.test.ts` (no exchange, no secrets).

A buy is refused when the mark (`markPrice`, else limit `price`) is at least `orders.maxChaseUpPct` (default 2%) above the latest accepted buy fill on that symbol and that fill is still inside `orders.chaseUpWindowMs` (default 15 minutes) (`Chase up`). Rejects and cancels do not count. Fills older than the window, other symbols, and submits with no positive mark still pass. Grid scale-in is downward, so this floor does not block a lower rung. Sells still pass so a stop or take-profit is not blocked. This is a chase floor, not a halt, and does not flatten positions. Vitest: `tests/chase-up.test.ts` (no exchange, no secrets).

See the file history for the full phase table. Default remains paper. Live keys stay on the server. Live mode stays blocked until the operator token is configured and presented.

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).
