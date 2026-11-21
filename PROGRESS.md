# Development progress

## Datum a čas

2026-11-21 19:14 CET (odd hour). Order-loyalty metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderLoyaltyReason` into the persistent OrderManager so a present `loyalty`, `loyaltyId`, or `orderLoyalty` is refused before any adapter call, matching the order-trust pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-loyalty.
- Added coverage in `tests/order-loyalty.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_LOYALTY_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)

# Development progress

## Datum a čas

2026-11-21 17:18 CET (odd hour). Order-trust metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderTrustReason` into the persistent OrderManager so a present `trust`, `trustId`, or `orderTrust` is refused before any adapter call, matching the order-faith pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-trust.
- Added coverage in `tests/order-trust.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_TRUST_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
