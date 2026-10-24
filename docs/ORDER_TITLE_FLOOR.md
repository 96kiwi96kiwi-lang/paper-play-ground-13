# Order title floor

A submit is refused when `title`, `orderTitle`, or `clientTitle` is present (`Title is not supported` / `Order title is not supported` / `Client title is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a title or order title. A title intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderTitleReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-title.test.ts` (no exchange, no secrets).
