# Positions alias floor

OrderManager refuses a present `positions`, `orderPositions`, or `basePositions` before the adapter.

Message examples:

- `Positions alias is not supported; the adapter reads amount`
- `Order positions alias is not supported; the adapter reads amount`
- `Base positions alias is not supported; the adapter reads amount`

Paper and KuCoin adapters place by canonical `amount` only. A positions alias would otherwise be ignored.

Omitted, null, and blank still pass. Zero is present and is refused.

This is a floor, not a hard-stop. It does not burn `maxRejectsInWindow` and does not flatten positions.

Default mode remains paper. No secrets.
