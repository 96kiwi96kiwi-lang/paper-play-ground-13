# Order remark floor

A submit is refused when `remark`, `orderRemark`, or `clientRemark` is present (`Order remark is not supported` / `Order remark alias is not supported` / `Client remark alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order remark, so a remark intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderRemarkReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-remark.test.ts` (no exchange, no secrets).
