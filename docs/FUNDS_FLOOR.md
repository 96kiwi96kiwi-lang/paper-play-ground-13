# Funds floor

`funds` (and aliases `quoteFunds`, `fundsAmount`) is a quote-currency size used by some spot APIs (notably KuCoin market buys) instead of a base amount.

The paper and KuCoin adapters place one plain spot order using the base `amount` and do not interpret a funds value, so a funds intent would otherwise be ignored and the base size would trade.

A present `funds`, `quoteFunds`, or `fundsAmount` (including zero or "0") is refused before the adapter. Omitted, null, false, and blank still pass.

This is a floor, not a halt, and does not flatten positions. It does not count against `maxRejectsInWindow`.

Default mode remains paper. No secrets.
