# Order form floor

A submit is refused when `form`, `orderForm`, or `clientForm` is present (`Order form is not supported` / `Order form alias is not supported` / `Client form alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order form, so a form intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderFormReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-form.test.ts` (no exchange, no secrets).
