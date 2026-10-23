# Order reference floor

A submit is refused when `reference`, `orderReference`, or `clientReference` is present (`Order reference is not supported` / `Order reference alias is not supported` / `Client reference alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order reference, so a reference intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderReferenceReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-reference.test.ts` (no exchange, no secrets).
