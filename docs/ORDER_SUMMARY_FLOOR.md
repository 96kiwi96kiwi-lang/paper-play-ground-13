# Order summary floor

A submit is refused when `summary`, `orderSummary`, or `clientSummary` is present (`Summary is not supported` / `Order summary is not supported` / `Client summary is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order summary, so a summary intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderSummaryReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-summary.test.ts` (no exchange, no secrets).
