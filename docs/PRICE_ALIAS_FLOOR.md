# Price-alias submit floor

Paper and KuCoin `placeLimitOrder` read `price` only. They do not read a price alias, limit price alias, or order price alias.

A present `px`, `limitPx`, or `orderPrice` is refused in `OrderManager.submit` before the adapter. Omitted, null, and blank still pass. Zero is present and is refused. This is a price floor, not a halt, and does not flatten positions. Paper remains the default. No secrets.
