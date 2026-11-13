# Development progress

## Datum a čas

2026-11-13 09:19 CET (odd hour). Order-body metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderBodyReason` into the persistent OrderManager so a present `body`, `orderBody`, or `clientBody` is refused before any adapter call, matching the order-description / order-caption pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Added `src/lib/orders/order-body.ts` with `orderBodyReason`.
- Added `tests/order-body.test.ts` with helper and OrderManager integration coverage.
- Updated `src/lib/orders/order-manager.ts` to call `orderBodyReason` in `submit`.
- Updated README current status and SAFETY checklist to include the order-body floor.

(Full historical record follows from prior PROGRESS.md content.)
