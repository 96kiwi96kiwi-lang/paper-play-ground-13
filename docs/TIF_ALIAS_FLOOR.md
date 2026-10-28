# Tif-alias floor

Refuse a present `tif`, `orderTif`, or `timeInForceAlias` before the adapter.

Paper and KuCoin adapters place by `timeInForce` only and do not read a tif alias. An alias intent would otherwise be ignored and the order would use the canonical timeInForce or fail.

Omitted, null, and blank still pass. Zero is refused.

This is a tif floor, not a halt, and does not flatten positions.

Default mode is paper. No secrets.
