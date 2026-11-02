# Order message floor

A submit is refused when `message`, `orderMessage`, or `clientMessage` is present (`Order message is not supported` / `Order message alias is not supported` / `Client message alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order message, so a message intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderMessageReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-message.test.ts` (no exchange, no secrets).
