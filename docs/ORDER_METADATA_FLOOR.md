# Order metadata floor

A submit is refused when `metadata`, `orderMetadata`, or `clientMetadata` is present (`Order metadata is not supported` / `Order metadata alias is not supported` / `Client metadata alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order metadata, so a metadata intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderMetadataReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-metadata.test.ts` (no exchange, no secrets).
