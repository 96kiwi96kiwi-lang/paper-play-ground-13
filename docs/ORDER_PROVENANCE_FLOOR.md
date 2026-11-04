# Order provenance floor

A submit is refused when `provenance`, `orderProvenance`, or `clientProvenance` is present (`Order provenance is not supported` / `Order provenance alias is not supported` / `Client provenance alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order provenance, so a provenance intent would be ignored and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderProvenanceReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-provenance.test.ts` (no exchange, no secrets).
