# Order urgency floor

A submit is refused when `urgency`, `orderUrgency`, or `clientUrgency` is present (`Order urgency is not supported` / `Order urgency alias is not supported` / `Client urgency alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order urgency, so an urgency intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderUrgencyReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-urgency.test.ts` (no exchange, no secrets).
