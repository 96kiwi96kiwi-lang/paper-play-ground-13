# Order-id floor

Refuse present `id`, `orderId`, or `clientId` before the adapter so an id-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach an id, so an id intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Default remains paper. No secrets.
