# Price-match floor

Paper and KuCoin adapters place one spot order at `price` or as a market and do not send `priceMatch`, `pegPriceType`, or `pegOffsetValue`. A present value is refused before the adapter so a book-relative or peg intent cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. `bbo` and `bookPrice` remain their own floor.

This is a price-match floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.

`OrderManager.submit` calls `priceMatchReason` before the adapter.
