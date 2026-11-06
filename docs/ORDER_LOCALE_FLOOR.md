# Order Locale Floor

A submit is refused when `locale`, `orderLocale`, or `clientLocale` is present (`Locale is not supported` / `Order locale is not supported` / `Client locale is not supported`).

Paper and KuCoin spot adapters place one plain spot order and do not attach a locale. A locale intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

`OrderManager.submit` calls `orderLocaleReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-locale.test.ts` (no exchange, no secrets).
