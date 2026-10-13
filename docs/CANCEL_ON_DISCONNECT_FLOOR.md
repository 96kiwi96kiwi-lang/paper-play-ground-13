# Cancel-on-disconnect floor

Paper and KuCoin adapters place one spot order and do not send `cancelOnDisconnect`, `deadman`, or `cod`. A present value is refused before the adapter so a dead-man intent cannot be silently ignored and leave a resting order live after the process drops.

Omitted, null, false, and blank pass. Zero is present and is refused. `cancelAfter` and `expireTime` remain their own floor.

This is a disconnect floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
