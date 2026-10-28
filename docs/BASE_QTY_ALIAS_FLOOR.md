# Base-qty-alias floor

Refuse a present `baseQty`, `orderBaseQty`, or `baseBaseQty` before the adapter.

Paper and KuCoin adapters place by `amount` only and do not read a base-qty alias. An alias intent would otherwise be ignored and the order would use the canonical amount or fail.

Omitted, null, and blank still pass. Zero is refused.

This is a base-qty floor, not a halt, and does not flatten positions.

Default mode is paper. No secrets.
