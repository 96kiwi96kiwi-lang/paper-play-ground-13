# Development progress

## Datum a čas

2026-11-19 09:19 CET (odd hour). Order-plot metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderPlotReason` into the persistent OrderManager so a present `plot`, `plotId`, or `clientPlot` is refused before any adapter call, matching the order-plan pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-plot.
- Added coverage in `tests/order-plot.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_PLOT_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
