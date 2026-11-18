# Development progress

## Datum a čas

2026-11-18 03:18 CET (odd hour). Order-chain metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderChainReason` into the persistent OrderManager so a present `chainId`, `orderChain`, or `clientChain` is refused before any adapter call, matching the order-batch pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-chain.
- Extended coverage in `tests/order-chain.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_CHAIN_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
