# Open/close offset submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They do not send an open or close offset.

A present `openClose`, `posOffset`, or `closeFraction` is refused in `OrderManager.submit` before the adapter. Omitted, null, false, and blank pass. Zero is present and is refused. `closePosition` remains its own floor. This is not a halt and does not flatten positions. Paper remains the default. No secrets.
