# Development progress

## Datum a čas

2026-11-16 13:23 CET (odd hour). Order-memo metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderMemoReason` into the persistent OrderManager so a present `memo`, `orderMemo`, or `clientMemo` is refused before any adapter call, matching the order-note pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-memo.
- Extended coverage already present in `tests/order-memo.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist (already listed), and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
