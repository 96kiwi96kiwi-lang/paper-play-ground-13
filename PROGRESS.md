# Development progress

## Datum a čas

2026-11-21 15:28 CET (odd hour). Order-faith metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderFaithReason` into the persistent OrderManager so a present `faith`, `faithId`, or `orderFaith` is refused before any adapter call, matching the order-belief pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-faith.
- Added coverage in `tests/order-faith.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_FAITH_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)

# Development progress

## Datum a čas

2026-11-21 13:21 CET (odd hour). Order-belief metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderBeliefReason` into the persistent OrderManager so a present `belief`, `beliefId`, or `orderBelief` is refused before any adapter call, matching the order-conviction pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-belief.
- Added coverage in `tests/order-belief.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_BELIEF_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
