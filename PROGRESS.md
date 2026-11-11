# Development progress

## Datum a čas

2026-11-11 23:16 CET (odd hour). Order-score metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderScoreReason` into the persistent OrderManager so a present `score`, `orderScore`, or `clientScore` is refused before any adapter call, matching the order-rank / order-priority pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderScoreReason` in `submit`.
- Added `src/lib/orders/order-score.ts` and `tests/order-score.test.ts` covering OrderManager submit regressions.
- Updated README current status and SAFETY checklist to include the order-score floor.

(Full historical record follows from prior PROGRESS.md content.)
