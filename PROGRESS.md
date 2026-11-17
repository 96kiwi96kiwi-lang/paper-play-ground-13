# Development progress

## Datum a čas

2026-11-17 01:22 CET (odd hour). Order-quote metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderQuoteReason` into the persistent OrderManager so a present `quote`, `orderQuote`, or `clientQuote` is refused before any adapter call, matching the order-digest pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-quote.
- Added coverage in `tests/order-quote.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
