# Order-tag floor

Refuse present `tag`, `orderTag`, or `clientTag` before the adapter so a tag-tracking intent cannot be ignored on a plain spot order.

Adapters place one plain spot order and do not attach a tag, so a tag intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

This is a metadata floor, not a halt, and does not flatten positions.

Wired into `OrderManager.submit` (Hour 309): calls `orderTagReason` after the order-correlation floor and before the adapter. A refuse does not burn `maxRejectsInWindow`.

Default remains paper. No secrets.

Vitest: `tests/order-tag.test.ts` (no exchange, no secrets).
