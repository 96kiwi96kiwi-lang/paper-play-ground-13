# Development progress

## Datum a čas

2026-11-18 11:15 CET (odd hour). Order-window metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderWindowReason` into the persistent OrderManager so a present `window`, `orderWindow`, or `clientWindow` is refused before any adapter call, matching the order-weight pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-window.
- Extended coverage in `tests/order-window.test.ts` with OrderManager integration.
- Updated README current status and PROGRESS.
- Confirmed `docs/ORDER_WINDOW_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
