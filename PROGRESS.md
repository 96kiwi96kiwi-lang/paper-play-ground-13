# Development progress

## Datum a čas

2026-11-14 01:21 CET (odd hour). Order-subject metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderSubjectReason` into the persistent OrderManager so a present `subject`, `orderSubject`, or `clientSubject` is refused before any adapter call, matching the order-header / order-footer pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing `src/lib/orders/order-subject.ts` (`orderSubjectReason`) into `src/lib/orders/order-manager.ts` `submit`.
- Extended `tests/order-subject.test.ts` with OrderManager integration coverage.
- Updated README current status and SAFETY checklist to include the order-subject floor.

(Full historical record follows from prior PROGRESS.md content.)
