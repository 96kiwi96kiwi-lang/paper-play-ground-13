# Development progress

## Datum a čas

2026-11-13 13:20 CET (odd hour). Order-footer metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderFooterReason` into the persistent OrderManager so a present `footer`, `orderFooter`, or `clientFooter` is refused before any adapter call, matching the order-body / order-description pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing `src/lib/orders/order-footer.ts` (`orderFooterReason`) into `src/lib/orders/order-manager.ts` `submit`.
- Extended `tests/order-footer.test.ts` with OrderManager integration coverage.
- Updated README current status and SAFETY checklist to include the order-footer floor.

(Full historical record follows from prior PROGRESS.md content.)
