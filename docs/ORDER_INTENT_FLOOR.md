# Order intent floor

`orderIntentReason` refuses a present `intent`, `intentId`, or `orderIntent`. Paper and KuCoin adapters place one plain spot order and do not attach an intent tag, so a present intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank pass. Zero is present and is refused.

This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-intent.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `orderIntentReason` after the will floor and before the adapter, so a refuse does not burn `maxRejectsInWindow`. A submit cannot carry these fields past the manager. No secrets.
