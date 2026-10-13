# Time-in-force submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They place a plain spot order as GTC and do not forward IOC, FOK, or other time-in-force flags.

A present `tif`, `timeInForceAlias`, `immediateOrCancel`, or `fillOrKill` is refused in `OrderManager.submit` before the adapter. A non-GTC `timeInForce` is also refused. Omitted, null, false, blank, and `GTC` pass. This is not a halt and does not flatten positions. Paper remains the default. No secrets.
