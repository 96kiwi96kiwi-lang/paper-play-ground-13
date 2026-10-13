# Order response-type floor

Paper and KuCoin adapters return one unified order and do not send `newOrderRespType`, `orderRespType`, or `respType`. A present value is refused before the adapter so an ACK, RESULT, or FULL expectation cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. `clientOrderId` and `validateOnly` remain their own floors.

This is a response-type floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
