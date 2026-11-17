# Development progress

## Datum a čas

2026-11-17 05:23 CET (odd hour). Order-remark metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderRemarkReason` into the persistent OrderManager so a present `remark`, `orderRemark`, or `clientRemark` is refused before any adapter call, matching the order-review pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-remark.
- Added coverage in `tests/order-remark.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_REMARK_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
