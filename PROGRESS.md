# Development progress

## Datum a čas

2026-11-17 21:21 CET (odd hour). Order-channel metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderChannelReason` into the persistent OrderManager so a present `channel`, `orderChannel`, or `origin` is refused before any adapter call, matching the order-context pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-channel.
- Updated coverage in `tests/order-channel.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist, and PROGRESS.
- Confirmed `docs/ORDER_CHANNEL_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
