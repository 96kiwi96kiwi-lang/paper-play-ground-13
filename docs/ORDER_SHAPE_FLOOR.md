# Order shape floor

A submit is refused when `shape`, `orderShape`, or `clientShape` is present (`Order shape is not supported` / `Order shape alias is not supported` / `Client shape alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order shape, so a shape intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderShapeReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-shape.test.ts` (no exchange, no secrets).
