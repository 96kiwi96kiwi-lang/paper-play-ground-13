# TP/SL trigger-source floor

Paper and KuCoin adapters place one plain spot order and do not send `tpTriggerBy`, `slTriggerBy`, or `triggerPxType`. A present value is refused before the adapter so a last, mark, or index stop cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. `tpTriggerPx`, `slTriggerPx`, and `tpslTriggerPx` remain the trigger-price floor.

`OrderManager.submit` calls `tpslTriggerByReason` before the adapter. A refuse does not burn `maxRejectsInWindow`. This is a TP/SL trigger-source floor, not a halt, and does not flatten positions. No secrets.
