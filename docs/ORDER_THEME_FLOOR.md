# Order theme floor

A submit is refused when `theme`, `orderTheme`, or `clientTheme` is present (`Order theme is not supported` / `Order theme alias is not supported` / `Client theme alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order theme, so a theme intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderThemeReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-theme.test.ts` (no exchange, no secrets).
