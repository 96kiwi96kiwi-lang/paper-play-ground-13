# Order visibility floor

A submit is refused when `visibility`, `orderVisibility`, or `clientVisibility` is present (`Order visibility is not supported` / `Order visibility alias is not supported` / `Client visibility alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order visibility, so a visibility intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderVisibilityReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-visibility.test.ts` (no exchange, no secrets).
