# Order name floor

A submit is refused when `name`, `orderName`, or `clientName` is present (`Name is not supported` / `Order name is not supported` / `Client name is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a name. A name intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderNameReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-name.test.ts` (no exchange, no secrets).
