# Development progress

## Datum a čas

2026-11-11 15:28 CET (odd hour). Order-priority metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderPriorityReason` into the persistent OrderManager so a present `priority`, `orderPriority`, or `clientPriority` is refused before any adapter call, matching the order-user / order-urgency pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderPriorityReason` in `submit`.
- Updated `tests/order-priority.test.ts` to cover OrderManager submit regressions.
- Updated README current status to include the order-priority floor.

(Full historical record follows from prior PROGRESS.md content.)
