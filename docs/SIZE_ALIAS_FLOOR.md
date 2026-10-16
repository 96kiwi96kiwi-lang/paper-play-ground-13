# Size-alias floor

Refuse a present `qty`, `size`, or `quantity` before the adapter.

Paper and KuCoin adapters place by `amount` only and do not read a size alias. An alias intent would otherwise be ignored and the order would use the canonical amount or fail.

Omitted, null, and blank still pass. Zero is refused.

This is a size floor, not a halt, and does not flatten positions.

Default mode is paper. No secrets.
