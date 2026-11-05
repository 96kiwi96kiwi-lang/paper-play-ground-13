# Order signature floor

A submit is refused when `signature`, `orderSignature`, or `clientSignature` is present (`Order signature is not supported` / `Order signature alias is not supported` / `Client signature alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not set an order signature, so a signature intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderSignatureReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-signature.test.ts` (no exchange, no secrets).
