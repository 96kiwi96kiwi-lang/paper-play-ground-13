# Order label floor

A submit is refused when `label`, `orderLabel`, or `clientLabel` is present (`Order label is not supported` / `Order label alias is not supported` / `Client label alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order label, so a label intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderLabelReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-label.test.ts` (no exchange, no secrets).
