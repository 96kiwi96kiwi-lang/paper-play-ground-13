# Development progress

## Datum a čas

2026-11-10 05:15 CET (odd hour). Order-annotation metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderAnnotationReason` into the persistent OrderManager so a present `annotation`, `orderAnnotation`, or `clientAnnotation` is refused before any adapter call, matching the order-style / order-theme pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderAnnotationReason` in `submit`.
- Extended `tests/order-annotation.test.ts` with OrderManager submit regressions.
- Updated README current status and SAFETY checklist to include the order-annotation floor.

(Full historical record follows from prior PROGRESS.md content.)
