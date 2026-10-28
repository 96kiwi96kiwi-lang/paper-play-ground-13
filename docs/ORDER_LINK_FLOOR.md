# Order link floor

A submit is refused when `clOrdId`, `orderLinkId`, or `linkId` is present (`Client order id is not supported` / `Order link id is not supported` / `Link id is not supported`).

Paper and KuCoin adapters place one plain spot order and identify only by `clientOrderId`. An external link alias would be ignored, so a retry would not be idempotent and could double-place.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderLinkReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a retry floor, not a halt, and does not flatten positions.

Vitest: `tests/order-link.test.ts` (no exchange, no secrets).
