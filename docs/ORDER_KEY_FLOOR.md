# Order-key floor

Refuse present `key`, `orderKey`, or `clientKey` before the adapter so a key-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach a key, so a key intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Default remains paper. No secrets.
