# Development progress

## Datum a čas

2026-11-14 13:20 CET (odd hour). Order-abstract metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderAbstractReason` into the persistent OrderManager so a present `abstract`, `orderAbstract`, or `clientAbstract` is refused before any adapter call, matching the order-name pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing `src/lib/orders/order-abstract.ts` (`orderAbstractReason`) into `src/lib/orders/order-manager.ts` `submit`.
- Extended `tests/order-abstract.test.ts` with OrderManager integration coverage.
- Updated README current status and SAFETY checklist to include the order-abstract floor.

(Full historical record follows from prior PROGRESS.md content.)
