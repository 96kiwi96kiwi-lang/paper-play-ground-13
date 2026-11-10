# Order annotation floor

Spot adapters place a plain spot order. They do not honor an `annotation`, `orderAnnotation`, or `clientAnnotation` field.

A present value is refused by `orderAnnotationReason` before any adapter call. Omitted, null, false, and blank values pass. This is a metadata floor, not a hard-stop. It does not flatten positions or require an operator token.

See `src/lib/orders/order-annotation.ts` and the call in `OrderManager.submit`.
