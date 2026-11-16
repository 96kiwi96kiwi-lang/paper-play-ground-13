# Development progress

## Datum a čas

2026-11-16 05:15 CET (odd hour). Order-kind metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderKindReason` into the persistent OrderManager so a present `kind`, `orderKind`, or `clientKind` is refused before any adapter call, matching the order-origin pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-kind.
- Extended `tests/order-kind.test.ts` with OrderManager integration coverage.
- Updated README current status, SAFETY checklist, and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
