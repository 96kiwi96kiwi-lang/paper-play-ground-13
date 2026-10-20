# Currency-alias floor

Refuse a present `currency`, `orderCurrency`, or `baseCurrency` before the adapter.

Paper and KuCoin adapters place by `amount` only and do not read a currency alias. An alias intent would otherwise be ignored and the order would use the canonical amount or fail.

Omitted, null, and blank still pass. Zero is refused.

This is a currency floor, not a halt, and does not flatten positions.

Default mode is paper. No secrets.
