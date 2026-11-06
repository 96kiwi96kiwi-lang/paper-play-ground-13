# Order zone floor

A submit is refused when `zone`, `orderZone`, or `clientZone` is present (`Order zone is not supported` / `Order zone alias is not supported` / `Client zone alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order zone, so a zone intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderZoneReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-zone.test.ts` (no exchange, no secrets).
