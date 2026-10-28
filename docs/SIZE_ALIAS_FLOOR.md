# Size-alias submit floor

Paper and KuCoin `placeLimitOrder` / `placeMarketOrder` read `amount` only. They do not read a size alias, qty, or quantity.

A present `qty`, `size`, or `quantity` is refused in `OrderManager.submit` before the adapter. Omitted, null, and blank still pass. Zero is present and is refused. This is a size floor, not a halt, and does not flatten positions. Paper remains the default. No secrets.
