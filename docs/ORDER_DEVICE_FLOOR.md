# Order Device Floor

A submit is refused when `device`, `orderDevice`, or `clientDevice` is present (`Device is not supported` / `Order device is not supported` / `Client device is not supported`).

Paper and KuCoin spot adapters place one plain spot order and do not attach a device. A device intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

`OrderManager.submit` calls `orderDeviceReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-device.test.ts` (no exchange, no secrets).
