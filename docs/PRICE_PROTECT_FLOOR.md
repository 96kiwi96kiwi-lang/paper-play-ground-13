# Price-protect floor

Paper and KuCoin adapters place one spot order and do not send `priceProtect`, `priceProtection`, or `percentPrice`. A present value is refused before the adapter so a price-band intent cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. This is a price-protect floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
