# Strategy and working-type floor

Paper and KuCoin adapters place one plain spot order. They do not attach an algo strategy and they do not honor a mark or contract working type.

`strategyIdReason` in `src/lib/orders/strategy-id.ts` refuses a present `strategyId`, `strategyType`, or `workingType` before the adapter. Omitted, null, false, and blank still pass. Zero is present and is refused. This is a strategy floor, not a halt, and does not flatten positions. It does not burn `maxRejectsInWindow` when called before the adapter.

Vitest: `tests/strategy-id.test.ts` (no exchange, no secrets).
