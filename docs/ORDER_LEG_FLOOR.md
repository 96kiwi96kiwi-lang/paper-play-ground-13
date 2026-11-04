# Order Leg Floor

Refuse present `legId`, `orderLeg`, or `clientLeg` on submit.

Paper and KuCoin spot adapters place one plain spot order and do not attach a leg. A multi-leg intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

See `src/lib/orders/order-leg.ts` and `tests/order-leg.test.ts`.
