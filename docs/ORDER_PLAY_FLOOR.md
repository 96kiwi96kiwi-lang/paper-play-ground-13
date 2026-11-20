# Order play floor

A submit is refused when `play`, `playId`, or `clientPlay` is present (`Play is not supported` / `Play id is not supported` / `Client play is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a play or playbook tag. A play intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderPlayReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-play.test.ts` (no exchange, no secrets).
