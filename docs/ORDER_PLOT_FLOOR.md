# Order plot floor

A submit is refused when `plot`, `plotId`, or `clientPlot` is present (`Plot is not supported` / `Plot id is not supported` / `Client plot is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a plot or playbook tag. A plot intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderPlotReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-plot.test.ts` (no exchange, no secrets).
