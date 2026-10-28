# Order custom floor

A submit is refused when `custom`, `customField`, or `clientCustom` is present (`Custom is not supported` / `Custom field is not supported` / `Client custom is not supported`).

Paper and KuCoin adapters place one plain spot order and do not forward client metadata, so a custom intent would be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderCustomReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-custom.test.ts` (no exchange, no secrets).
