# Development progress

## Datum a čas

2026-11-17 07:20 CET (odd hour). Order-reference metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderReferenceReason` into the persistent OrderManager so a present `reference`, `orderReference`, or `clientReference` is refused before any adapter call, matching the order-remark pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-reference.
- Added coverage in `tests/order-reference.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_REFERENCE_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
