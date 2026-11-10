# Order style floor

Spot adapters place a plain spot order. They do not honor a `style`, `orderStyle`, or `clientStyle` field.

A present value is refused by `orderStyleReason` before any adapter call. Omitted, null, false, and blank values pass. This is a metadata floor, not a hard-stop. It does not flatten positions or require an operator token.

See `src/lib/orders/order-style.ts` and the call in `OrderManager.submit`.
