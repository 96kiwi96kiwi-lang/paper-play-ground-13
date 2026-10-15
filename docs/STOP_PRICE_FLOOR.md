# Stop-price floor

Paper and KuCoin adapters place one plain spot order and do not send `stopPrice`, `triggerPrice`, or `stopPx`. A present value is refused before the adapter so a stop or trigger intent cannot be silently ignored and the order rest or fill as a plain spot order at the given price or as a market.

Omitted, null, false, and blank pass. Zero is present and is refused.

This is a stop-price floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
