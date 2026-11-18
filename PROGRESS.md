# Development progress

## Datum a čas

2026-11-18 05:15 CET (odd hour). Order-group metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderGroupReason` into the persistent OrderManager so a present `group`, `orderGroup`, or `clientGroup` is refused before any adapter call, matching the order-chain pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-group.
- Extended coverage in `tests/order-group.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_GROUP_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
