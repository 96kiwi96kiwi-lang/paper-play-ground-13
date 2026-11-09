# Order-template metadata floor

OrderManager refuses a present `template`, `templateId`, or `clientTemplate` before any paper or live adapter call.

The spot adapters place one plain market or limit order. They do not forward template / blueprint metadata. A present value would otherwise be dropped and the order would rest or fill as a plain spot order.

This is a metadata floor, not a halt. It does not flatten positions.

Zero is treated as present and is refused. Omitted, null, false, and blank strings pass.

Vitest: `tests/order-template.test.ts` (no exchange, no secrets).
