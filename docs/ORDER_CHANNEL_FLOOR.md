# Order channel floor

A submit is refused when `channel`, `orderChannel`, or `origin` is present (`Order channel is not supported` / `Order channel alias is not supported` / `Origin alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order channel or origin tag, so a channel intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderChannelReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-channel.test.ts` (no exchange, no secrets).
