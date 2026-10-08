# Order force floor

`orderForceReason` refuses a present `force`, `forceType`, or `orderForce`. Paper and KuCoin adapters place one spot order and read `timeInForce` only, so IOC, FOK, or post-only packed in those fields would otherwise be ignored and the order would rest as GTC.

Omitted, null, false, and blank pass. Zero is present and is refused. `timeInForce`, `tif`, and `postOnly` remain their own floors.

This is a force floor, not a halt, and does not flatten positions. Vitest: `tests/order-force.test.ts` (no exchange, no secrets).

`OrderManager.submit` does not call `orderForceReason` yet. Until that call is wired, a submit can still carry these fields. No secrets.
