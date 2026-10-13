# TP/SL order-price floor

Paper and KuCoin adapters place one plain spot order and do not send `tpOrdPx`, `slOrdPx`, or `tpslPx`. A present value is refused before the adapter so a take-profit or stop-loss limit price cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. `tpOrderType`, `stopLossPrice`, `takeProfitPrice`, and `attachAlgoOrds` remain their own floors.

`OrderManager.submit` calls `tpslOrderPriceReason` before the adapter. A refuse does not burn `maxRejectsInWindow`. This is a TP/SL order-price floor, not a halt, and does not flatten positions. No secrets.
