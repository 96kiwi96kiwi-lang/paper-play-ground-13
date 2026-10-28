# Position-idx submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` send symbol, side, base amount, optional limit price, and optional client order id. They place one plain spot order and do not forward a position index, pos index, or hedge index.

A present `positionIdx`, `posIdx`, or `hedgeIdx` is refused in `OrderManager.submit` before the adapter. Omitted, null, false, and blank pass. Zero is present and is refused. This is a position floor, not a halt, and does not flatten positions. Paper remains the default. No secrets.
