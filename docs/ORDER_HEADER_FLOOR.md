# Order header metadata floor

OrderManager refuses a present `header`, `orderHeader`, or `clientHeader` before the adapter.

Message examples:

- `Header is not supported; the adapter would place a plain spot order`
- `Order header is not supported; the adapter would place a plain spot order`
- `Client header is not supported; the adapter would place a plain spot order`

Paper and KuCoin adapters place one plain spot order and do not attach a header. A header intent would otherwise be dropped and the order would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

This is a metadata floor, not a hard-stop. It does not burn `maxRejectsInWindow` and does not flatten positions.

Default mode remains paper. No secrets.
