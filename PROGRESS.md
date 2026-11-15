# Development progress

## Datum a čas

2026-11-15 19:13 CET (odd hour). Order-purpose metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderPurposeReason` into the persistent OrderManager so a present `purpose`, `orderPurpose`, or `clientPurpose` is refused before any adapter call, matching the order-audience pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into new `src/lib/orders/order-purpose.ts` (`orderPurposeReason`) and into `src/lib/orders/order-manager.ts` `submit`.
- Added `tests/order-purpose.test.ts` with OrderManager integration coverage.
- Added `docs/ORDER_PURPOSE_FLOOR.md`.
- Updated README current status, SAFETY checklist, and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
