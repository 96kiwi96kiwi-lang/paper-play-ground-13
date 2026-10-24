# Order account floor

A submit is refused when `account`, `orderAccount`, or `clientAccount` is present (`Account is not supported` / `Order account is not supported` / `Client account is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach an account or order account. An account intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderAccountReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-account.test.ts` (no exchange, no secrets).
