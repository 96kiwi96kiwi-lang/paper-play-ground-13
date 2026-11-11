# Development progress

## Datum a čas

2026-11-11 07:16 CET (odd hour). Order-user metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderUserReason` into the persistent OrderManager so a present `user`, `orderUser`, or `clientUser` is refused before any adapter call, matching the order-urgency / order-theme pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderUserReason` in `submit`.
- Updated `tests/order-user.test.ts` to cover OrderManager submit regressions.
- Updated README current status and SAFETY checklist to include the order-user floor.

(Full historical record follows from prior PROGRESS.md content.)
