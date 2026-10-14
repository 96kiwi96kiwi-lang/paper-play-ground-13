# Attach-algo floor

A present `attachAlgoOrds`, `tpTriggerPx`, or `slTriggerPx` is refused before the adapter.

Paper and KuCoin adapters place one plain spot order and do not attach a take-profit or stop-loss algo, so a bracket intent would otherwise be ignored and the base size would trade.

Omitted, null, false, blank, and an empty list still pass. Zero is refused.

This is a bracket floor, not a halt, and does not flatten positions.

Default mode is paper. No secrets.
