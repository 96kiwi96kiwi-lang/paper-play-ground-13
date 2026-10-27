# Order caption floor

A submit is refused when `caption`, `orderCaption`, or `clientCaption` is present (`Caption is not supported` / `Order caption is not supported` / `Client caption is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a caption or order caption. A caption intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderCaptionReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-caption.test.ts` (no exchange, no secrets).
