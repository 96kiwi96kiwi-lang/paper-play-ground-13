# Development progress

## Datum a čas

2026-11-17 17:37 CET (odd hour). Order-correlation metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderCorrelationReason` into the persistent OrderManager so a present `correlation`, `orderCorrelation`, or `clientCorrelation` is refused before any adapter call, matching the order-attribution pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-correlation.
- Updated coverage in `tests/order-correlation.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_CORRELATION_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
