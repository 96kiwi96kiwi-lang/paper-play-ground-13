# Development progress

## Datum a čas

2026-11-16 01:23 CET (odd hour). Order-origin metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderOriginReason` into the persistent OrderManager so a present `origin`, `orderOrigin`, or `clientOrigin` is refused before any adapter call, matching the order-source pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-origin.
- Extended `tests/order-origin.test.ts` with OrderManager integration coverage.
- Updated README current status, SAFETY checklist, and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
