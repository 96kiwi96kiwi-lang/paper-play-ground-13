# Order-type alias floor

`ordType`, `orderType`, and `order_type` are aliases some clients use for the order type.

The paper and KuCoin adapters read only `type`. An omitted type defaults to market, so a present alias would otherwise be ignored and a limit intent could trade as a market.

A present `ordType`, `orderType`, or `order_type` (including zero or "0") is refused before the adapter. Omitted, null, and blank still pass.

This is a type floor, not a halt, and does not flatten positions. It does not count against `maxRejectsInWindow`.

Default mode remains paper. No secrets.
