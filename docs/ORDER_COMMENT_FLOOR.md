# Order comment floor

A submit is refused when `comment`, `orderComment`, or `clientComment` is present (`Order comment is not supported` / `Order comment alias is not supported` / `Client comment alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order comment, so a comment intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderCommentReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-comment.test.ts` (no exchange, no secrets).
