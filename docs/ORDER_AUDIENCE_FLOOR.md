# Order audience floor

A submit is refused when `audience`, `orderAudience`, or `clientAudience` is present (`Order audience is not supported` / `Order audience alias is not supported` / `Client audience alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order audience, so an audience intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderAudienceReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-audience.test.ts` (no exchange, no secrets).
