# Order-version floor

A submit is refused when `version`, `orderVersion`, or `clientVersion` is present (`Version is not supported` / `Order version is not supported` / `Client version is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order version, so a version-tracking intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderVersionReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-version.test.ts` (no exchange, no secrets).

Default remains paper. No secrets.
