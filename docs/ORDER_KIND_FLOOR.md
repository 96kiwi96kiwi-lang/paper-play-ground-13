# Order kind floor

A submit is refused when `kind`, `orderKind`, or `clientKind` is present (`Order kind is not supported` / `Order kind alias is not supported` / `Client kind alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order kind, so a kind intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderKindReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-kind.test.ts` (no exchange, no secrets).
