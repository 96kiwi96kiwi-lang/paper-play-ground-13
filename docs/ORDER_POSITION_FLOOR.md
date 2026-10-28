# Order position floor

A submit is refused when `position`, `orderPosition`, or `clientPosition` is present (`Position is not supported` / `Order position is not supported` / `Client position is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a position or order position. A position intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderPositionReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-position.test.ts` (no exchange, no secrets).
