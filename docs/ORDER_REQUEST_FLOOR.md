# Order-request floor

Refuse present `requestId`, `orderRequestId`, or `clientRequestId` before the adapter so a request-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach a request id, so a request intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Default remains paper. No secrets.
