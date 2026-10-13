# TP/SL order-type floor

Paper and KuCoin adapters place one plain spot order and do not send `tpOrderType`, `slOrderType`, or `tpslMode`. A present value is refused before the adapter so a partial or full take-profit or stop-loss exit cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. `stopLossPrice`, `takeProfitPrice`, and `attachAlgoOrds` remain their own floors.

This is a TP/SL order-type floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
