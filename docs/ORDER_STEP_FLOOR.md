# Order step floor

A submit is refused when `step`, `stepId`, or `clientStep` is present (`Step is not supported` / `Step id is not supported` / `Client step is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a step or steps tag. A step intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderStepReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-step.test.ts` (no exchange, no secrets).
