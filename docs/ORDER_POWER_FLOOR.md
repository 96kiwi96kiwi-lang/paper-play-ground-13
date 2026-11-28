# Order power floor

`orderPowerReason` refuses a present `power`, `powerId`, or `orderPower`. Paper and KuCoin adapters place one plain spot order and do not attach a power tag, so a present power would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank pass. Zero is present and is refused.

This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-power.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `orderPowerReason` after the might floor and before the adapter, so a refuse does not burn `maxRejectsInWindow`. A submit cannot carry these fields past the manager. No secrets.
