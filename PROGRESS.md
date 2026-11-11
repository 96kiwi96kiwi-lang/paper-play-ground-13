# Development progress

## Datum a čas

2026-11-11 19:15 CET (odd hour). Order-rank metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderRankReason` into the persistent OrderManager so a present `rank`, `orderRank`, or `clientRank` is refused before any adapter call, matching the order-priority / order-user pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderRankReason` in `submit`.
- Added `src/lib/orders/order-rank.ts` and `tests/order-rank.test.ts` covering OrderManager submit regressions.
- Updated README current status and SAFETY checklist to include the order-rank floor.

(Full historical record follows from prior PROGRESS.md content.)
