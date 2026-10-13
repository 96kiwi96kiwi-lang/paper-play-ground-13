# Order remark floor

A submit is refused when `remark`, `tag`, or `clientTag` is present (`Remark is not supported` / `Tag is not supported` / `Client tag is not supported`).

Paper and KuCoin adapters place one plain spot order and do not forward a client remark, so a remark intent would be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderRemarkReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-remark.test.ts` (no exchange, no secrets).
