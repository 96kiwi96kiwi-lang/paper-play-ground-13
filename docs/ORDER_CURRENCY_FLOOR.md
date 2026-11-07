# Order Currency Floor

A submit is refused when `currency`, `orderCurrency`, or `clientCurrency` is present (`Currency is not supported` / `Order currency is not supported` / `Client currency is not supported`).

Paper and KuCoin spot adapters place one plain spot order and do not attach a currency. A currency intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

`OrderManager.submit` calls `orderCurrencyReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-currency.test.ts` (no exchange, no secrets).
