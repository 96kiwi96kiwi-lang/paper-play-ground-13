# Order Related Floor

Refuse present `relatedId`, `orderRelated`, or `clientRelated` on submit.

Paper and KuCoin spot adapters place one plain spot order and do not attach a related order. A related-order intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

See `src/lib/orders/order-related.ts` and `tests/order-related.test.ts`.
