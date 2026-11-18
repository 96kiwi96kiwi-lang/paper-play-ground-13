# Development progress

## Datum a čas

2026-11-18 09:22 CET (odd hour). Order-weight metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderWeightReason` into the persistent OrderManager so a present `weight`, `orderWeight`, or `clientWeight` is refused before any adapter call, matching the order-zone pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-weight.
- Extended coverage in `tests/order-weight.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_WEIGHT_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
