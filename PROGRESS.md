# Development progress

## Datum a čas

2026-11-19 13:24 CET (odd hour). Order-story metadata floor wired into OrderManager.

## Aktuální stav

Paper mode is the default. Live trading is disabled. No exchange credentials are in the tree.

**Hour (odd):** Wired `orderStoryReason` into the persistent OrderManager so a present `story`, `storyId`, or `clientStory` is refused before any adapter call, matching the order-scenario pattern. Tests cover the helper and the submit path. Default remains paper. No secrets. No live without server-side owner credentials.

Previous verified state remains as below.

## Dokončené změny

- Wired existing pattern into OrderManager.submit for order-story.
- Added coverage in `tests/order-story.test.ts` with OrderManager integration.
- Updated README current status, SAFETY checklist mention, and PROGRESS.
- Added `docs/ORDER_STORY_FLOOR.md`.

(Full historical record follows from prior PROGRESS.md content.)
