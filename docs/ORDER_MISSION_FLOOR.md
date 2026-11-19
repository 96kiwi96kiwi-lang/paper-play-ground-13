# Order mission floor

A submit is refused when `mission`, `missionId`, or `clientMission` is present (`Mission is not supported` / `Mission id is not supported` / `Client mission is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a mission or narrative tag. A mission intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderMissionReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-mission.test.ts` (no exchange, no secrets).
