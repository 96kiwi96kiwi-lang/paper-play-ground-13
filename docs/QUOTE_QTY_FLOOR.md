# Quote-quantity floor

Paper and KuCoin adapters place one plain spot order using the base `amount` and do not interpret `quoteQty`, `quoteOrderQty`, or `notional`. A present value is refused before the adapter so a quote-size intent cannot be silently ignored and the base amount trade instead.

Omitted, null, false, and blank pass. Zero is present and is refused.

This is a quote-quantity floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
