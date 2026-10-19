# Portfolio alias floor

OrderManager refuses a present `portfolio`, `orderPortfolio`, or `basePortfolio` before the adapter.

Message examples:

- `Portfolio alias is not supported; the adapter reads amount`
- `Order portfolio alias is not supported; the adapter reads amount`
- `Base portfolio alias is not supported; the adapter reads amount`

Paper and KuCoin adapters place by canonical `amount` only. A portfolio alias would otherwise be ignored.

Omitted, null, and blank still pass. Zero is present and is refused.

This is a floor, not a hard-stop. It does not burn `maxRejectsInWindow` and does not flatten positions.

Default mode remains paper. No secrets.
