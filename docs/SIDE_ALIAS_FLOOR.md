# Side-alias submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` read `side` only. They do not read an order side alias, direction, or action.

A present `orderSide`, `direction`, or `action` is refused in `OrderManager.submit` before the adapter. Omitted, null, and blank still pass. Zero is present and is refused. This is a side floor, not a halt, and does not flatten positions. Paper remains the default. No secrets.
