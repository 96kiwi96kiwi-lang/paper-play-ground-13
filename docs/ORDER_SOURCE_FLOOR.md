# Order-source floor

Refuse present `source`, `orderSource`, or `src` before the adapter so a source-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach a source or partner tag, so a source intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

`OrderManager.submit` calls `orderSourceReason` after the order-external floor and before the paper path. A refuse does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-source.ts` and `tests/order-source.test.ts`.

Default remains paper. No secrets.
