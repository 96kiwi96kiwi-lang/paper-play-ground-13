# Development progress

## Datum a čas

2026-11-13 01:21 CET (odd hour). Order-caption metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderCaptionReason` into the persistent OrderManager so a present `caption`, `orderCaption`, or `clientCaption` is refused before any adapter call, matching the order-brief / order-summary pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderCaptionReason` in `submit`.
- Extended `tests/order-caption.test.ts` with OrderManager integration coverage.
- Updated README current status and SAFETY checklist to include the order-caption floor.

(Full historical record follows from prior PROGRESS.md content.)
