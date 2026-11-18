# Development progress

## Datum a čas

2026-11-18 13:25 CET (odd hour). Order-span metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderSpanReason` into the persistent OrderManager so a present `span`, `orderSpan`, or `clientSpan` is refused before any adapter call, matching the order-window pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-span.
- Extended coverage in `tests/order-span.test.ts` with OrderManager integration.
- Updated README current status and PROGRESS.
- Confirmed `docs/ORDER_SPAN_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
