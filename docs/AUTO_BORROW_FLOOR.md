# Auto-borrow floor

`autoBorrowReason` refuses a present `autoBorrow` or `autoRepay` (true or non-boolean). Paper and KuCoin adapters place one plain spot order and do not send a borrow or repay flag, so an auto-borrow or auto-repay intent would otherwise be ignored and the base size would trade on the cash spot book without borrowing or repaying margin.

Omitted, null, false, and blank pass. This is a margin floor, not a halt, and does not flatten positions. Vitest: `tests/auto-borrow.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `autoBorrowReason` after the leverage floor and before the adapter. No secrets.
