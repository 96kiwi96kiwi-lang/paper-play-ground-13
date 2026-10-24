# Order text floor

A submit is refused when `text`, `orderText`, or `clientText` is present (`Text is not supported` / `Order text is not supported` / `Client text is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach free-text or order text. A text intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderTextReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-text.test.ts` (no exchange, no secrets).
