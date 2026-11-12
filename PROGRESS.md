# Development progress

## Datum a čas

2026-11-12 07:17 CET (odd hour). Order-rating metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderRatingReason` into the persistent OrderManager so a present `rating`, `orderRating`, or `clientRating` is refused before any adapter call, matching the order-score / order-rank pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderRatingReason` in `submit`.
- Added `src/lib/orders/order-rating.ts` and `tests/order-rating.test.ts` covering OrderManager submit regressions.
- Updated README current status and SAFETY checklist to include the order-rating floor.

(Full historical record follows from prior PROGRESS.md content.)
