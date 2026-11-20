# Order scheme floor

A submit is refused when `scheme`, `schemeId`, or `clientScheme` is present (`Scheme is not supported` / `Scheme id is not supported` / `Client scheme is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a scheme or playbook tag. A scheme intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderSchemeReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-scheme.test.ts` (no exchange, no secrets).
