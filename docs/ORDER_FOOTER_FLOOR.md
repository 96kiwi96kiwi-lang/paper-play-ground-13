# Order footer floor

A submit is refused when `footer`, `orderFooter`, or `clientFooter` is present (`Footer is not supported` / `Order footer is not supported` / `Client footer is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order footer, so a footer intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderFooterReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-footer.test.ts` (no exchange, no secrets).
