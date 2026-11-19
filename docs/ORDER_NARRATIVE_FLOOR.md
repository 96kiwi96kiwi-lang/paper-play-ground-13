# Order narrative floor

A submit is refused when `narrative`, `narrativeId`, or `clientNarrative` is present (`Narrative is not supported` / `Narrative id is not supported` / `Client narrative is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a narrative or story tag. A narrative intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderNarrativeReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-narrative.test.ts` (no exchange, no secrets).
