# Order ardor floor

`orderArdorReason` refuses a present `ardor`, `ardorId`, or `orderArdor`. Paper and KuCoin adapters place one plain spot order and do not attach an ardor tag, so a present ardor would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank pass. Zero is present and is refused.

This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-ardor.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `orderArdorReason` after the fervor floor and before the adapter, so a refuse does not burn `maxRejectsInWindow`. A submit cannot carry these fields past the manager. No secrets.
