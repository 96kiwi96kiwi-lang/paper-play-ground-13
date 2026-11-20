# Order quest floor

A submit is refused when `quest`, `questId`, or `clientQuest` is present (`Quest is not supported` / `Quest id is not supported` / `Client quest is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a quest or narrative tag. A quest intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderQuestReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-quest.test.ts` (no exchange, no secrets).
