# Order uuid floor

A submit is refused when `uuid`, `orderUuid`, or `clientUuid` is present (`Uuid is not supported` / `Order uuid is not supported` / `Client uuid is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order uuid, so a uuid intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderUuidReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-uuid.test.ts` (no exchange, no secrets).
