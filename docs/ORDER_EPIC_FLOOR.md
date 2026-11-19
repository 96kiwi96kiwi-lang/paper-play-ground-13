# Order epic floor

A submit is refused when `epic`, `epicId`, or `clientEpic` is present (`Epic is not supported` / `Epic id is not supported` / `Client epic is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach an epic or narrative tag. An epic intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderEpicReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-epic.test.ts` (no exchange, no secrets).
