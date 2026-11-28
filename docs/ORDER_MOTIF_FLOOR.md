# Order motif floor

A submit is refused when `motif`, `orderMotif`, or `clientMotif` is present (`Order motif is not supported` / `Order motif alias is not supported` / `Client motif alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order motif, so a motif intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderMotifReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-motif.test.ts` (no exchange, no secrets).
