# Order Leg Floor

A submit is refused when `legId`, `orderLeg`, or `clientLeg` is present (`Leg id is not supported` / `Order leg is not supported` / `Client leg is not supported`).

Paper and KuCoin spot adapters place one plain spot order and do not attach a leg. A multi-leg intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

`OrderManager.submit` calls `orderLegReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-leg.test.ts` (no exchange, no secrets).
