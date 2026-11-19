# Development progress

## Datum a čas

2026-11-19 21:22 CET (odd hour). Order-quest metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderQuestReason` into the persistent OrderManager so a present `quest`, `questId`, or `clientQuest` is refused before any adapter call, matching the order-epic pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-quest.
- Added coverage in `tests/order-quest.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_QUEST_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
