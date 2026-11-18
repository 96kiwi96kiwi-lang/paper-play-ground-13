# Order-stage floor

Refuse present `stage`, `orderStage`, or `clientStage` before the adapter so a stage-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach a stage, so a stage intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Wired into OrderManager.submit. Default remains paper. No secrets.
