# Order attribution floor

A submit is refused when `attribution`, `orderAttribution`, or `clientAttribution` is present (`Order attribution is not supported` / `Order attribution alias is not supported` / `Client attribution alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order attribution, so an attribution intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderAttributionReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-attribution.test.ts` (no exchange, no secrets).
