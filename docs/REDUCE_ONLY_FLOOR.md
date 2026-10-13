# Reduce-only submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They do not send a reduce-only flag.

A present `reduceOnly` (true or any non-boolean) is refused in `OrderManager.submit` before the adapter. Omitted, null, and false pass. This is not a halt and does not flatten positions. Paper remains the default. No secrets.
