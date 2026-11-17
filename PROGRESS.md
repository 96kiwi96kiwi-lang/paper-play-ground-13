# Development progress

## Datum a čas

2026-11-17 19:19 CET (odd hour). Order-context metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderContextReason` into the persistent OrderManager so a present `context`, `orderContext`, or `clientContext` is refused before any adapter call, matching the order-correlation pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-context.
- Updated coverage in `tests/order-context.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_CONTEXT_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
