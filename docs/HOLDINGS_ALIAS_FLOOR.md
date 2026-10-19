# Holdings alias floor

OrderManager refuses a present `holdings`, `orderHoldings`, or `baseHoldings` before the adapter.

Message examples:

- `Holdings alias is not supported; the adapter reads amount`
- `Order holdings alias is not supported; the adapter reads amount`
- `Base holdings alias is not supported; the adapter reads amount`

Paper and KuCoin adapters place by canonical `amount` only. A holdings alias would otherwise be ignored.

Omitted, null, and blank still pass. Zero is present and is refused.

This is a floor, not a hard-stop. It does not burn `maxRejectsInWindow` and does not flatten positions.

Default mode remains paper. No secrets.
