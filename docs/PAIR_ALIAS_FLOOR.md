# Pair-alias floor

Refuse a present `pair`, `market`, or `instrument` before the adapter.

Paper and KuCoin adapters place by `symbol` only and do not read a pair alias. An alias intent would otherwise be ignored and the order would use the canonical symbol or fail.

Omitted, null, and blank still pass. Zero is refused.

This is a pair floor, not a halt, and does not flatten positions.

Default mode is paper. No secrets.
