# Development progress

## Datum a čas

2026-11-18 21:10 CET (odd hour). Order-step metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderStepReason` into the persistent OrderManager so a present `step`, `orderStep`, or `clientStep` is refused before any adapter call, matching the order-stage pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-step.
- Extended coverage in `tests/order-step.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Confirmed `docs/ORDER_STEP_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
