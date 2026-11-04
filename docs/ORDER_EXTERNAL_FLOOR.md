# Order-external floor

Refuse present `externalId`, `orderExternal`, or `clientExternal` before the adapter so an external-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach an external id, so an external intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

`OrderManager.submit` calls `orderExternalReason` after the order-sibling floor and before the paper path. A refuse does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-external.ts` and `tests/order-external.test.ts`.

Default remains paper. No secrets.
