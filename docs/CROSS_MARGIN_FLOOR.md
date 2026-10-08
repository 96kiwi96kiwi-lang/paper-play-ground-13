# Cross-margin floor

`crossMarginReason` refuses a present `mgnMode`, `tradeMode`, or `isCross`. Paper and KuCoin adapters place one plain spot order and do not open a cross margin account, so a cross or isolated intent in those aliases would otherwise be ignored and the base size would trade on the spot book.

Omitted, null, false, and blank pass. Zero is present and is refused. `leverage`, `marginMode`, and `tdMode` remain the leverage-mode floor.

This is a margin floor, not a halt, and does not flatten positions. Vitest: `tests/cross-margin.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `crossMarginReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. No secrets.
