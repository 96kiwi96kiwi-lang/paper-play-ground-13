# Order-tag floor

Refuse present `tag`, `orderTag`, or `clientTag` before the adapter so a tag-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach a tag, so a tag intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Wired into OrderManager.submit. Default remains paper. No secrets.
