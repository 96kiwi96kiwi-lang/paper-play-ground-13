# Development progress

## Datum a čas

2026-11-14 21:16 CET (odd hour). Order-tag metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderTagReason` into the persistent OrderManager so a present `tag`, `orderTag`, or `clientTag` is refused before any adapter call, matching the order-label pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing `src/lib/orders/order-tag.ts` (`orderTagReason`) into `src/lib/orders/order-manager.ts` `submit`.
- Extended `tests/order-tag.test.ts` with OrderManager integration coverage.
- Updated README current status and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
