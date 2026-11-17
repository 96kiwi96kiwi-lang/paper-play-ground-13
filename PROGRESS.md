# Development progress

## Datum a čas

2026-11-17 03:21 CET (odd hour). Order-review metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderReviewReason` into the persistent OrderManager so a present `review`, `orderReview`, or `clientReview` is refused before any adapter call, matching the order-quote pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-review.
- Added coverage in `tests/order-review.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Added `docs/ORDER_REVIEW_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
