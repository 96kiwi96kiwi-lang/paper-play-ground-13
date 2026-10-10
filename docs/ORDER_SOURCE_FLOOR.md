# Order source floor

A submit is refused when `source`, `orderSource`, or `src` is present (`Order source is not supported` / `Order source alias is not supported` / `Source alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order source or partner tag, so a source intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderSourceReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-source.test.ts` (no exchange, no secrets).
