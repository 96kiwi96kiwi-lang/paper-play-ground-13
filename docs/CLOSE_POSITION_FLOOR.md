# Close-position submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They do not send a close-position flag.

A present `closePosition`, `closeOnTrigger`, or `closeOrder` is refused in `OrderManager.submit` before the adapter. Omitted, null, false, and blank pass. This is not a halt and does not flatten positions. Paper remains the default. No secrets.
