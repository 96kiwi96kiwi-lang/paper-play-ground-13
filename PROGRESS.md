# Development progress

## Datum a čas

2026-11-16 23:17 CET (odd hour). Order-digest metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderDigestReason` into the persistent OrderManager so a present `digest`, `orderDigest`, or `clientDigest` is refused before any adapter call, matching the order-synopsis pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-digest.
- Extended coverage already present in `tests/order-digest.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.

(Full historical record follows from prior PROGRESS.md content.)
