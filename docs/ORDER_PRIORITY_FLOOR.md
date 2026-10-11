# Order priority floor

A submit is refused when `priority`, `orderPriority`, or `timePriority` is present (`Order priority is not supported` / `Order priority alias is not supported` / `Time priority alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set a priority, so a priority intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderPriorityReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-priority.test.ts` (no exchange, no secrets).
