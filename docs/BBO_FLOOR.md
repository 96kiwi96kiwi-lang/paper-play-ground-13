# Book-price floor

Paper and KuCoin adapters place one spot order at `price` or as a market and do not send `bbo`, `bestBidOffer`, or `bookPrice`. A present value is refused before the adapter so a best-bid/offer intent cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. `priceMatch` and `pegOffsetValue` remain their own floor.

This is a book-price floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
