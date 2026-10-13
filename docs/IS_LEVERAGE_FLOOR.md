# Is-leverage floor

`isLeverageReason` refuses a present `isLeverage`, `leverageFlag`, or `marginLeverage`. Paper and KuCoin adapters place one plain spot order and do not send a margin-leverage flag, so a borrow-on-spot intent would otherwise be ignored and the base size would trade on cash.

Omitted, null, false, and blank pass. Zero and `TRUE` are present and are refused. `leverage`, `marginMode`, and `isMargin` remain their own floors.

This is a leverage-flag floor, not a halt, and does not flatten positions. Vitest: `tests/is-leverage.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `isLeverageReason` before the adapter. No secrets.
