# Order body floor

A submit is refused when `body`, `orderBody`, or `clientBody` is present (`Body is not supported` / `Order body is not supported` / `Client body is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order body, so a body intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderBodyReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-body.test.ts` (no exchange, no secrets).
