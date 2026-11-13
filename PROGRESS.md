# Development progress

## Datum a čas

2026-11-13 23:16 CET (odd hour). Order-header metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderHeaderReason` into the persistent OrderManager so a present `header`, `orderHeader`, or `clientHeader` is refused before any adapter call, matching the order-footer / order-body pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing `src/lib/orders/order-header.ts` (`orderHeaderReason`) into `src/lib/orders/order-manager.ts` `submit`.
- Extended `tests/order-header.test.ts` with OrderManager integration coverage.
- Updated README current status and SAFETY checklist to include the order-header floor.

(Full historical record follows from prior PROGRESS.md content.)
