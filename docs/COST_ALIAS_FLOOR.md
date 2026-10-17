# Cost-alias floor

Refuse a present `cost`, `orderCost`, or `baseCost` before the adapter.

Paper and KuCoin adapters place by `amount` only and do not read a cost alias. An alias intent would otherwise be ignored and the order would use the canonical amount or fail.

Omitted, null, and blank still pass. Zero is refused.

This is a cost floor, not a halt, and does not flatten positions.

Default mode is paper. No secrets.
