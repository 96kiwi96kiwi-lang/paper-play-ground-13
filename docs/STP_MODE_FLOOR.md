# STP mode floor

Paper and KuCoin adapters place one spot order and do not send `stpMode`, `smpType`, or `preventSelfTrade`. A present value is refused before the adapter so cancel-newest or expire-taker cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. `stp`, `selfTradePrevention`, and `selfTradePreventionMode` remain their own floor.

This is a matching floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
