# Order-correlation floor

Refuse present `correlation`, `orderCorrelation`, or `clientCorrelation` before the adapter so a correlation-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach a correlation, so a correlation intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Wired into `OrderManager.submit` (Hour 307): calls `orderCorrelationReason` after the order-context floor and before the adapter. A refuse does not burn `maxRejectsInWindow`.

Default remains paper. No secrets.

Vitest: `tests/order-correlation.test.ts` (no exchange, no secrets).
