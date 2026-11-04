# Order template floor

A submit is refused when `template`, `orderTemplate`, or `clientTemplate` is present (`Template is not supported` / `Order template is not supported` / `Client template is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a template or order type tag. A template intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderTemplateReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-template.test.ts` (no exchange, no secrets).
