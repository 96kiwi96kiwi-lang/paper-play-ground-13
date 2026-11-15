# Development progress

## Datum a čas

2026-11-15 23:19 CET (odd hour). Order-source metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderSourceReason` into the persistent OrderManager so a present `source`, `orderSource`, or `clientSource` is refused before any adapter call, matching the order-purpose pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-source.
- Extended `tests/order-source.test.ts` with OrderManager integration coverage.
- Updated README current status, SAFETY checklist, and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
