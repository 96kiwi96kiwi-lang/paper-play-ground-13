# Working type floor

A submit is refused when `workingType`, `stopWorkingType`, or `triggerBy` is present (`Working type is not supported` / `Stop working type is not supported` / `Trigger by is not supported`).

Paper and KuCoin adapters place one plain spot order and do not select a mark, index, or last trigger. A working-type intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `workingTypeReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a trigger-source floor, not a halt, and does not flatten positions.

Vitest: `tests/working-type.test.ts` (no exchange, no secrets).
