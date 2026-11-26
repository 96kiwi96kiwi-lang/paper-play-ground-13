# Progress

## Hour 13 (odd, 2026-11-26): order-quest metadata floor

Wired `orderQuestReason` into the persistent OrderManager so a present `quest`, `questId`, or `clientQuest` is refused before any adapter call, matching the order-mission pattern.

- Helper already existed in `src/lib/orders/order-quest.ts`.
- Tests already covered the helper and the submit path in `tests/order-quest.test.ts`.
- Updated README current status, docs/ORDER_QUEST_FLOOR.md (already accurate), and this progress note.

Default remains paper. No secrets. No live trading without server-side owner credentials.

Previous floors (order-mission, order-goal, etc.) remain in place.

## Hour 11 (odd, 2026-11-26): order-mission metadata floor

Wired `orderMissionReason` into the persistent OrderManager so a present `mission`, `missionId`, or `clientMission` is refused before any adapter call, matching the order-goal pattern.

- Helper already existed in `src/lib/orders/order-mission.ts`.
- Tests already covered the helper and the submit path in `tests/order-mission.test.ts`.
- Updated README current status, docs/ORDER_MISSION_FLOOR.md (already accurate), and this progress note.

Default remains paper. No secrets. No live trading without server-side owner credentials.

Previous floors (order-goal, order-force, etc.) remain in place.

## Hour 9 (odd, 2026-11-26): order-goal metadata floor

Wired `orderGoalReason` into the persistent OrderManager so a present `goal`, `goalId`, or `clientGoal` is refused before any adapter call, matching the order-force pattern.

- Helper already existed in `src/lib/orders/order-goal.ts`.
- Tests already covered the helper and the submit path in `tests/order-goal.test.ts`.
- Updated README current status, docs/ORDER_GOAL_FLOOR.md (already accurate), and this progress note.

Default remains paper. No secrets. No live trading without server-side owner credentials.

Previous floors (order-force, order-intent, etc.) remain in place.

## Hour 7 (odd, 2026-11-26): order-force metadata floor

Wired `orderForceReason` into the persistent OrderManager so a present `force`, `forceType`, or `orderForce` is refused before any adapter call, matching the order-intent pattern.

- Helper already existed in `src/lib/orders/order-force.ts`.
- Tests already covered the helper and the submit path in `tests/order-force.test.ts`.
- Updated README current status, docs/ORDER_FORCE_FLOOR.md, and this progress note.

Default remains paper. No secrets. No live trading without server-side owner credentials.

Previous floors (order-intent, order-will, etc.) remain in place.

## Hour 5 (odd, 2026-11-26): order-intent metadata floor

Wired `orderIntentReason` into the persistent OrderManager so a present `intent`, `intentId`, or `orderIntent` is refused before any adapter call, matching the order-will pattern.

- Helper already existed in `src/lib/orders/order-intent.ts`.
- Tests already covered the helper and the submit path in `tests/order-intent.test.ts`.
- Updated README current status, docs/ORDER_INTENT_FLOOR.md, and this progress note.

Default remains paper. No secrets. No live trading without server-side owner credentials.

Previous floors (order-will, order-dream, etc.) remain in place.
