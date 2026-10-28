# Order payload floor

A submit is refused when `payload`, `orderPayload`, or `clientPayload` is present (`Order payload is not supported` / `Order payload alias is not supported` / `Client payload alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order payload, so a payload intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderPayloadReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-payload.test.ts` (no exchange, no secrets).
