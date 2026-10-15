# Fee-currency submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They do not forward a fee asset or deduct-fee flag.

A present `feeCurrency`, `feeCcy`, or `deductFee` is refused in `OrderManager.submit` before the adapter. Omitted, null, false, and blank pass. Zero is present and is refused. This is a fee floor, not a halt, and does not flatten positions. Paper remains the default. No secrets.
