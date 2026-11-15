# Development progress

## Datum a čas

2026-11-15 05:16 CET (odd hour). Order-text metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderTextReason` into the persistent OrderManager so a present `text`, `orderText`, or `clientText` is refused before any adapter call, matching the order-template pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing `src/lib/orders/order-text.ts` (`orderTextReason`) into `src/lib/orders/order-manager.ts` `submit`.
- Extended `tests/order-text.test.ts` with OrderManager integration coverage.
- Updated README current status and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
