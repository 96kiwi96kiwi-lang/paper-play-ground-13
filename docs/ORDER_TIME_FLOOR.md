# Order time floor

A submit is refused when `timestamp`, `orderTimestamp`, or `clientTimestamp` is present (`Timestamp is not supported` / `Order timestamp is not supported` / `Client timestamp is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a timestamp. A time-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderTimeReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-time.test.ts` (no exchange, no secrets).
