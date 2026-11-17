# Development progress

## Datum a čas

2026-11-17 09:24 CET (odd hour). Order-signature metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderSignatureReason` into the persistent OrderManager so a present `signature`, `orderSignature`, or `clientSignature` is refused before any adapter call, matching the order-reference pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-signature.
- Updated coverage in `tests/order-signature.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_SIGNATURE_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
