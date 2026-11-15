# Development progress

## Datum a čas

2026-11-15 15:29 CET (odd hour). Order-audience metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderAudienceReason` into the persistent OrderManager so a present `audience`, `orderAudience`, or `clientAudience` is refused before any adapter call, matching the order-algo pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing `src/lib/orders/order-audience.ts` (`orderAudienceReason`) into `src/lib/orders/order-manager.ts` `submit`.
- Extended `tests/order-audience.test.ts` with OrderManager integration coverage.
- Updated README current status and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
