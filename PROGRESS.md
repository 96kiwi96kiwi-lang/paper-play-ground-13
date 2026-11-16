# Development progress

## Datum a čas

2026-11-16 09:22 CET (odd hour). Order-comment metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderCommentReason` into the persistent OrderManager so a present `comment`, `orderComment`, or `clientComment` is refused before any adapter call, matching the order-kind pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-comment.
- Extended `tests/order-comment.test.ts` with OrderManager integration coverage.
- Updated README current status, SAFETY checklist, and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
