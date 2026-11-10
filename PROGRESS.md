# Development progress

## Datum a čas

2026-11-10 23:17 CET (odd hour). Order-urgency metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderUrgencyReason` into the persistent OrderManager so a present `urgency`, `orderUrgency`, or `clientUrgency` is refused before any adapter call, matching the order-theme / order-annotation pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Updated `src/lib/orders/order-manager.ts` to call `orderUrgencyReason` in `submit`.
- Updated `tests/order-urgency.test.ts` to cover OrderManager submit regressions.
- Updated README current status and SAFETY checklist to include the order-urgency floor.

(Full historical record follows from prior PROGRESS.md content.)
