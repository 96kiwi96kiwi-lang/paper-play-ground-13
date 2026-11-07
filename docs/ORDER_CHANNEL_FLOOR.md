# Order Channel Floor

A submit is refused when `channel`, `orderChannel`, or `origin` is present (`Order channel is not supported` / `Order channel alias is not supported` / `Origin alias is not supported`).

Paper and KuCoin spot adapters place one plain spot order and do not attach a channel or origin tag. A channel intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass; zero is refused.

`OrderManager.submit` calls `orderChannelReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-channel.test.ts` (no exchange, no secrets).
