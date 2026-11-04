# Order nonce floor

A submit is refused when `nonce`, `orderNonce`, or `clientNonce` is present (`Nonce is not supported` / `Order nonce is not supported` / `Client nonce is not supported`).

Paper and KuCoin adapters place one plain spot order and do not attach a nonce. A nonce intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderNonceReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-nonce.test.ts` (no exchange, no secrets).
