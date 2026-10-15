# Product category submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They do not send a product category.

A present `category`, `productType`, or `instType` that is not spot or cash is refused in `OrderManager.submit` before the adapter. Spot and cash (any case) pass. Omitted, null, false, and blank pass. Zero is present and is refused. This is not a halt and does not flatten positions. Paper remains the default. No secrets.
