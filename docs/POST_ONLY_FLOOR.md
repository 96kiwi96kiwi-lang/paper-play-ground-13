# Post-only floor

Paper and KuCoin adapters place one plain spot order. They do not set a post-only or maker-only flag, so a maker-only intent would rest or fill as a taker.

`postOnlyReason` in `src/lib/orders/post-only.ts` refuses a present `postOnly`, `postOnlyFlag`, or `makerOnly` before the adapter. Omitted, null, false, and blank still pass. Zero is present and is refused. This is a matching floor, not a halt, and does not flatten positions. It does not burn `maxRejectsInWindow` when called before the adapter.

Vitest: `tests/post-only.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `postOnlyReason` before the adapter. No secrets.
