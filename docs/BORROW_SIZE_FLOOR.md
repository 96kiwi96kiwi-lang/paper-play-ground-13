# Borrow-size floor

A submit is refused when `borrowAmount`, `borrowSize`, or `loanAmount` is present (`Borrow amount is not supported` / `Borrow size is not supported` / `Loan amount is not supported`).

Paper and KuCoin adapters place one spot order and do not borrow, so a loan size would be ignored and the full base amount would trade on cash. Omitted, null, false, and blank still pass. Zero is present and is refused. Auto-borrow booleans remain their own floor.

This runs in `OrderManager.submit` before the adapter, so it does not burn `maxRejectsInWindow`. This is a borrow floor, not a halt, and does not flatten positions.

Vitest: `tests/borrow-size.test.ts` (no exchange, no secrets). Default remains paper. Live keys stay on the server.
