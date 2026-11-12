# Development progress

## Datum a čas

2026-11-12 13:20 CET (odd hour). Order-grade metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderGradeReason` into the persistent OrderManager so a present `grade`, `orderGrade`, or `clientGrade` is refused before any adapter call, matching the order-rating / order-score pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderGradeReason` in `submit`.
- Added `src/lib/orders/order-grade.ts` and `tests/order-grade.test.ts` covering OrderManager submit regressions.
- Updated README current status and SAFETY checklist to include the order-grade floor.

(Full historical record follows from prior PROGRESS.md content.)
