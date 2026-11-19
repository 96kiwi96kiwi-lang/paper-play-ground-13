# Order plan floor

A submit is refused when `plan`, `planId`, or `clientPlan` is present (`Plan is not supported` / `Plan id is not supported` / `Client plan is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a plan or playbook tag. A plan intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderPlanReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-plan.test.ts` (no exchange, no secrets).
