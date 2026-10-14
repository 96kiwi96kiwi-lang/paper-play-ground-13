# Broker attribution floor

Paper and KuCoin adapters place one plain spot order and do not send `brokerId`, `brokerClientId`, or `rebate`. A present value is refused before the adapter so an expected partner split or rebate cannot be silently ignored and the order still rests or fills on the server key account.

Omitted, null, false, and blank pass. Zero is present and is refused.

This is a broker floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
