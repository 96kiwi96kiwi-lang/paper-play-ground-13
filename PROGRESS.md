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

# Development progress

## Datum a čas

2026-11-21 11:14 CET (odd hour). Order-conviction metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderConvictionReason` into the persistent OrderManager so a present `conviction`, `convictionId`, or `orderConviction` is refused before any adapter call, matching the order-assurance pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-conviction.
- Added coverage in `tests/order-conviction.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_CONVICTION_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
