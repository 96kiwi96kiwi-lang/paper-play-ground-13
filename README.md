# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 5 (odd):** Price gap hard-stop is now configurable via `risk.priceGapLimitPct` (default 3.5%) in `src/config/trading.ts`. A relative jump vs the last recorded tick at or above that limit sets `haltReason` and notifies hard-stop listeners. Network error streak, daily loss, max drawdown, and losing streak remain hard-stops. Default mode is paper.

A submit is refused when `isMargin`, `margin`, or `is_margin` is present (`Is-margin is not supported` / `Margin flag is not supported` / `Is-margin alias is not supported`). Paper and KuCoin adapters place one plain spot order and do not open a margin account, so a margin intent would be ignored and the base size would trade on cash. Omitted, null, false, and blank still pass. Zero is present and is refused. `leverage`, `marginMode`, and `tdMode` remain the leverage-mode floor. `OrderManager.submit` calls `isMarginReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a margin floor, not a halt, and does not flatten positions. Vitest: `tests/is-margin.test.ts` (no exchange, no secrets).

(Full floor list and architecture remain unchanged; see prior content and file history for the complete phase table.)
