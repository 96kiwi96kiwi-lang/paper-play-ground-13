# Good-till-time floor

`goodTillTimeReason` refuses a present `goodTillTime`, `gtd`, or `expireAt`. Paper and KuCoin adapters place one spot order and do not send an expiry, so a good-till-time intent would otherwise be ignored and the order would rest until a later cancel.

Omitted, null, false, and blank pass. Zero is present and is refused. `cancelAfter`, `expireTime`, and `goodTillDate` remain the expiry floor.

This is an expiry-alias floor, not a halt, and does not flatten positions. Vitest: `tests/good-till-time.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `goodTillTimeReason` before the adapter. No secrets.
