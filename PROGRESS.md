# Development progress

## Datum a čas

2026-11-22 15:26 CET (odd hour). Order-might metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderMightReason` into the persistent OrderManager so a present `might`, `mightId`, or `orderMight` is refused before any adapter call, matching the order-power pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-might.
- Added coverage in `tests/order-might.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_MIGHT_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)

# Development progress

## Datum a čas

2026-11-22 13:20 CET (odd hour). Order-power metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderPowerReason` into the persistent OrderManager so a present `power`, `powerId`, or `orderPower` is refused before any adapter call, matching the order-energy pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-power.
- Added coverage in `tests/order-power.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_POWER_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
