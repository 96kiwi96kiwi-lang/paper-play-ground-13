# Development progress

## Datum a čas

2026-11-16 15:37 CET (odd hour). Order-message metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderMessageReason` into the persistent OrderManager so a present `message`, `orderMessage`, or `clientMessage` is refused before any adapter call, matching the order-memo pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-message.
- Extended coverage already present in `tests/order-message.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist (already listed), and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
