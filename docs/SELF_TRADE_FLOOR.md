# Self-trade prevention submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They do not forward a self-trade prevention mode.

A present `stp`, `selfTradePrevention`, or `selfTradePreventionMode` is refused in `OrderManager.submit` before the adapter. Omitted, null, and blank pass. Zero is present and is refused. Known KuCoin codes (CN, CO, CB, DC) are refused. This is a matching floor, not a halt, and does not flatten positions. Paper remains the default. No secrets.
