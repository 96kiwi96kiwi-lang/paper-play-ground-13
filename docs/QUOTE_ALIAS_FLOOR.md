# Quote-alias floor

Refuse a present `quote`, `orderQuote`, or `baseQuote` before the adapter.

Paper and KuCoin adapters place by `amount` only and do not read a quote alias. An alias intent would otherwise be ignored and the order would use the canonical amount or fail.

Omitted, null, and blank still pass. Zero is refused.

This is a quote floor, not a halt, and does not flatten positions.

Default mode is paper. No secrets.
