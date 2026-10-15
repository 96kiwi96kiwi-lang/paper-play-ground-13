# Client-id alias floor

`clientOid`, `newClientOrderId`, and `origClientOrderId` are aliases some clients use for the client order id.

The paper and KuCoin adapters identify an order by `clientOrderId` only. KuCoin createOrder is not given a clientOid. A present alias would otherwise be ignored, so a retry would not be idempotent and could double-place.

A present `clientOid`, `newClientOrderId`, or `origClientOrderId` (including zero or "0") is refused before the adapter. Omitted, null, and blank still pass.

This is a retry floor, not a halt, and does not flatten positions. It does not count against `maxRejectsInWindow`.

Default mode remains paper. No secrets.
