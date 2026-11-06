# Order window floor

A submit is refused when `window`, `orderWindow`, or `clientWindow` is present (`Order window is not supported` / `Order window alias is not supported` / `Client window alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order window, so a window intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderWindowReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-window.test.ts` (no exchange, no secrets).
