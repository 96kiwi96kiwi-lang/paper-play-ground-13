# Nav alias floor

OrderManager refuses a present `nav`, `orderNav`, or `baseNav` before the adapter.

Message examples:

- `Nav alias is not supported; the adapter reads amount`
- `Order nav alias is not supported; the adapter reads amount`
- `Base nav alias is not supported; the adapter reads amount`

Paper and KuCoin adapters place by canonical `amount` only. A nav alias would otherwise be ignored.

Omitted, null, and blank still pass. Zero is present and is refused.

This is a floor, not a hard-stop. It does not burn `maxRejectsInWindow` and does not flatten positions.

Default mode remains paper. No secrets.
