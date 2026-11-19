# Order story floor

A submit is refused when `story`, `storyId`, or `clientStory` is present (`Story is not supported` / `Story id is not supported` / `Client story is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a story or narrative tag. A story intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderStoryReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-story.test.ts` (no exchange, no secrets).
