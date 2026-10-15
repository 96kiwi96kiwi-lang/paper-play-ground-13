# Trailing-stop floor

Paper and KuCoin adapters place one plain spot order and do not send `trailingStop`, `trailingDelta`, `callbackRate`, or `activationPrice`. A present value is refused before the adapter so a trailing intent cannot be silently ignored and the order rest or fill as a plain spot order at the given price or as a market.

Omitted, null, false, and blank pass. Zero is present and is refused.

This is a trailing floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
