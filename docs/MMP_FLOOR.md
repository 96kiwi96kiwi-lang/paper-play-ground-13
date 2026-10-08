# Market-maker protection floor

Paper and KuCoin adapters place one spot order and do not send `mmp`, `mmpGroup`, or `marketMakerProtection`. A present value is refused before the adapter so an MMP flag or group cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. `priceProtect` and `slippage` remain their own floors.

This is a protection floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
