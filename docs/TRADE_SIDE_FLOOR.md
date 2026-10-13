# Trade-side submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They do not send a futures trade side, hold side, or open type.

A present `tradeSide`, `holdSide`, or `openType` is refused in `OrderManager.submit` before the adapter. Omitted, null, false, and blank pass. Zero is present and is refused. `openClose` remains its own floor. This is not a halt and does not flatten positions. Paper remains the default. No secrets.
