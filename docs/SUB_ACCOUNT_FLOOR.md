# Sub-account submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They place on the authenticated spot trade account only and do not route to a sub-account.

A present `subAccount`, `subUid`, or `accountId` is refused in `OrderManager.submit` before the adapter. Omitted, null, false, and blank pass. Zero is present and is refused. This is a routing floor, not a halt, and does not flatten positions. Paper remains the default. No secrets.
