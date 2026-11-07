# Order Region Floor

A submit is refused when `region`, `orderRegion`, or `clientRegion` is present (`Region is not supported` / `Order region is not supported` / `Client region is not supported`).

Paper and KuCoin spot adapters place one plain spot order and do not attach a region. A region intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

`OrderManager.submit` calls `orderRegionReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-region.test.ts` (no exchange, no secrets).
