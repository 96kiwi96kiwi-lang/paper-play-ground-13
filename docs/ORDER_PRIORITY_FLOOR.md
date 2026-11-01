# Order-priority floor

Refuse present `priority`, `orderPriority`, or `clientPriority` before the adapter so a priority-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach a priority, so a priority intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Wired into OrderManager.submit (Hour 429). Default remains paper. No secrets.
