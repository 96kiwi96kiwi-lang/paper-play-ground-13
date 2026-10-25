# Order-token floor

Refuse present `token`, `orderToken`, or `clientToken` before the adapter so a token-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach a token, so a token intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Default remains paper. No secrets.
