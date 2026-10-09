# Is-margin floor

A submit is refused when `isMargin`, `margin`, or `is_margin` is present.

Paper and KuCoin adapters place one plain spot order and do not open a margin account, so a margin intent would be ignored and the base size would trade on cash.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`leverage`, `marginMode`, and `tdMode` remain on the leverage-mode floor. `mgnMode` remains on the cross-margin floor.

`OrderManager.submit` calls `isMarginReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`.

This is a margin floor, not a halt, and does not flatten positions.

Vitest: `tests/is-margin.test.ts` (no exchange, no secrets).
