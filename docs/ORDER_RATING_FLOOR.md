# Order-rating floor

Paper and KuCoin adapters place one plain spot order and do not attach a rating. A present `rating`, `orderRating`, or `clientRating` is refused before the adapter so a rating-tracking intent cannot be silently ignored and the order would trade as a plain spot order.

Omitted, null, false, and blank pass. Zero is present and is refused.

This is a metadata floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
