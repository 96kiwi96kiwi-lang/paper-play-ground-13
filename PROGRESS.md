# Progress

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
