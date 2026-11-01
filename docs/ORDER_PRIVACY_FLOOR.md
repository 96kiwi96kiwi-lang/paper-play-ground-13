# Order privacy floor

A submit is refused when `privacy`, `orderPrivacy`, or `clientPrivacy` is present (`Order privacy is not supported` / `Order privacy alias is not supported` / `Client privacy alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order privacy, so a privacy intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderPrivacyReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-privacy.test.ts` (no exchange, no secrets).
