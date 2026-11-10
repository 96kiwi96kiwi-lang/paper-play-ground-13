# Order-urgency floor

Refuse present `urgency`, `orderUrgency`, or `clientUrgency` before the adapter so an urgency-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach an urgency, so an urgency intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Wired into OrderManager.submit. Default remains paper. No secrets.
