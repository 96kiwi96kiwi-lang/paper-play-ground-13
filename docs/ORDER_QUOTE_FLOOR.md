# Order quote floor

Refuse a present `quote`, `orderQuote`, or `clientQuote` on submit before the adapter.

- Omitted, null, false, and blank pass.
- Zero is present and is refused.
- This is a metadata floor, not a halt, and does not flatten positions.
- Paper and KuCoin adapters place one plain spot order and do not set an order quote, so a quote-tracking intent would otherwise be dropped.
- Does not burn `maxRejectsInWindow`.

See `src/lib/orders/order-quote.ts` and `tests/order-quote.test.ts`.
