# Development progress

## Datum a čas

2026-11-22 07:16 CET (odd hour). Order-intensity metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderIntensityReason` into the persistent OrderManager so a present `intensity`, `intensityId`, or `orderIntensity` is refused before any adapter call, matching the order-ardor pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-intensity.
- Added coverage in `tests/order-intensity.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_INTENSITY_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)

# Development progress

## Datum a čas

2026-11-22 05:13 CET (odd hour). Order-ardor metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderArdorReason` into the persistent OrderManager so a present `ardor`, `ardorId`, or `orderArdor` is refused before any adapter call, matching the order-fervor pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-ardor.
- Added coverage in `tests/order-ardor.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_ARDOR_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
