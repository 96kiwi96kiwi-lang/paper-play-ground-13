# Development progress

## Datum a čas

2026-11-17 13:25 CET (odd hour). Order-fingerprint metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderFingerprintReason` into the persistent OrderManager so a present `fingerprint`, `orderFingerprint`, or `clientFingerprint` is refused before any adapter call, matching the order-hash pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-fingerprint.
- Updated coverage in `tests/order-fingerprint.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_FINGERPRINT_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
