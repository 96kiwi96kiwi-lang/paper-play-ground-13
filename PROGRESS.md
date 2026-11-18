# Development progress

## Datum a čas

2026-11-18 07:19 CET (odd hour). Order-zone metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderZoneReason` into the persistent OrderManager so a present `zone`, `orderZone`, or `clientZone` is refused before any adapter call, matching the order-group pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-zone.
- Extended coverage in `tests/order-zone.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_ZONE_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
