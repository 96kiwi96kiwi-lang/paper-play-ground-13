# Development progress

## Datum a čas

2026-11-14 05:14 CET (odd hour). Order-title metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderTitleReason` into the persistent OrderManager so a present `title`, `orderTitle`, or `clientTitle` is refused before any adapter call, matching the order-subject / order-header pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing `src/lib/orders/order-title.ts` (`orderTitleReason`) into `src/lib/orders/order-manager.ts` `submit`.
- Extended `tests/order-title.test.ts` with OrderManager integration coverage.
- Updated README current status and SAFETY checklist to include the order-title floor.

(Full historical record follows from prior PROGRESS.md content.)
