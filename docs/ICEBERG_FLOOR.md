# Iceberg and hidden-size floor

Paper and KuCoin adapters place one plain spot order. They do not forward an iceberg flag or a display / hidden / visible size, so the full amount would rest or fill on the book.

`icebergReason` in `src/lib/orders/iceberg.ts` refuses a present `iceberg`, `visibleSize`, `icebergQty`, `displayQty`, `hiddenSize`, `displaySize`, `visibleQty`, or `icebergSize` before the adapter. Omitted, null, false, and blank still pass. Zero is present and is refused. This is a display floor, not a halt, and does not flatten positions. It does not burn `maxRejectsInWindow` when called before the adapter.

Vitest: `tests/iceberg.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `icebergReason` before the adapter. No secrets.
