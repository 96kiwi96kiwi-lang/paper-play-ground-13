# Development progress

## Datum a čas

2026-11-22 11:12 CET (odd hour). Order-energy metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderEnergyReason` into the persistent OrderManager so a present `energy`, `energyId`, or `orderEnergy` is refused before any adapter call, matching the order-vigor pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-energy.
- Added coverage in `tests/order-energy.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_ENERGY_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)

# Development progress

## Datum a čas

2026-11-22 09:18 CET (odd hour). Order-vigor metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderVigorReason` into the persistent OrderManager so a present `vigor`, `vigorId`, or `orderVigor` is refused before any adapter call, matching the order-intensity pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-vigor.
- Added coverage in `tests/order-vigor.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_VIGOR_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
