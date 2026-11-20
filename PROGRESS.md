# Development progress

## Datum a čas

2026-11-20 03:17 CET (odd hour). Order-force metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderForceReason` into the persistent OrderManager so a present `force`, `forceType`, or `orderForce` is refused before any adapter call, matching the order-goal pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-force.
- Added coverage in `tests/order-force.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Confirmed `docs/ORDER_FORCE_FLOOR.md` already documents the floor.

(Full historical record follows from prior PROGRESS.md content.)

# Development progress

## Datum a čas

2026-11-20 01:20 CET (odd hour). Order-goal metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderGoalReason` into the persistent OrderManager so a present `goal`, `goalId`, or `clientGoal` is refused before any adapter call, matching the order-mission pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-goal.
- Added coverage in `tests/order-goal.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_GOAL_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
