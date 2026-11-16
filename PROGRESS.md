# Development progress

## Datum a čas

2026-11-16 11:15 CET (odd hour). Order-note metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderNoteReason` into the persistent OrderManager so a present `note`, `orderNote`, or `clientNote` is refused before any adapter call, matching the order-comment pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-note.
- Extended `tests/order-note.test.ts` with OrderManager integration coverage.
- Updated README current status, SAFETY checklist, and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
