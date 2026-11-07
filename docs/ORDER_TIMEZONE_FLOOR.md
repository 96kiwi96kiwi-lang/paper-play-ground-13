# Order Timezone Floor

A submit is refused when `timezone`, `orderTimezone`, or `clientTimezone` is present (`Timezone is not supported` / `Order timezone is not supported` / `Client timezone is not supported`).

Paper and KuCoin spot adapters place one plain spot order and do not attach a timezone. A timezone intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

`OrderManager.submit` calls `orderTimezoneReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-timezone.test.ts` (no exchange, no secrets).
