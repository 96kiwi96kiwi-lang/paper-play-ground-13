# Order goal floor

A submit is refused when `goal`, `goalId`, or `clientGoal` is present (`Goal is not supported` / `Goal id is not supported` / `Client goal is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a goal or narrative tag. A goal intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderGoalReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-goal.test.ts` (no exchange, no secrets).
