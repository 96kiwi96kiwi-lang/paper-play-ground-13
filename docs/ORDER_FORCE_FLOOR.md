# Order force floor

Paper and KuCoin adapters place one spot order and read `timeInForce` only. They do not send `force`, `forceType`, or `orderForce`. A present value is refused before the adapter so IOC, FOK, or post-only packed in force cannot be silently ignored and rest as GTC.

Omitted, null, false, and blank pass. Zero is present and is refused. `timeInForce`, `tif`, and `postOnly` remain their own floors.

This is a force floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
