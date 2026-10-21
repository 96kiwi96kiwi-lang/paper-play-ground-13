# Stop-price-alias floor

Refuse a present `stopPrice`, `triggerPrice`, or `stopPx` before the adapter.

Paper and KuCoin adapters place by `price` or market only and do not read a stop-price alias. An alias intent would otherwise be ignored and the order would place as a plain market or limit.

Omitted, null, and blank still pass. Zero is refused.

This is a stop floor, not a halt, and does not flatten positions.

Default mode is paper. No secrets.
