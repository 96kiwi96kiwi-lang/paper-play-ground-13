# Order tactic floor

A submit is refused when `tactic`, `tacticId`, or `clientTactic` is present (`Tactic is not supported` / `Tactic id is not supported` / `Client tactic is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a tactic or tactics tag. A tactic intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderTacticReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-tactic.test.ts` (no exchange, no secrets).
