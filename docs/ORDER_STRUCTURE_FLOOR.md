# Order structure floor

A submit is refused when `structure`, `orderStructure`, or `clientStructure` is present (`Order structure is not supported` / `Order structure alias is not supported` / `Client structure alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order structure, so a structure intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderStructureReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-structure.test.ts` (no exchange, no secrets).
