# Order-list / OCO submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They place one plain spot order and do not forward an OCO, order-list id, list client order id, above/below type, or stop-limit price.

A present `oco`, `orderListId`, `listClientOrderId`, `aboveType`, `belowType`, or `stopLimitPrice` is refused in `OrderManager.submit` before the adapter. Omitted, null, false, and blank pass. Zero is present and is refused. This is a list floor, not a halt, and does not flatten positions. Paper remains the default. No secrets.
