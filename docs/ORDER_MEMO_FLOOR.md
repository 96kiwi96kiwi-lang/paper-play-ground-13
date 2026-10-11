# Order memo floor

A submit is refused when `memo`, `orderMemo`, or `clientMemo` is present (`Order memo is not supported` / `Order memo alias is not supported` / `Client memo alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order memo, so a memo intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderMemoReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-memo.test.ts` (no exchange, no secrets).
