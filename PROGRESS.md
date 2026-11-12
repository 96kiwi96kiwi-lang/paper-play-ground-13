# Development progress

## Datum a čas

2026-11-12 19:17 CET (odd hour). Order-outline metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderOutlineReason` into the persistent OrderManager so a present `outline`, `orderOutline`, or `clientOutline` is refused before any adapter call, matching the order-level / order-grade pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderOutlineReason` in `submit`.
- Expanded `tests/order-outline.test.ts` to cover OrderManager submit regressions.
- Updated README current status and SAFETY checklist to include the order-outline floor.

(Full historical record follows from prior PROGRESS.md content.)
