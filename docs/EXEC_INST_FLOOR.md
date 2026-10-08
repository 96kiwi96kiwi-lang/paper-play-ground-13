# Execution instruction floor

Paper and KuCoin adapters place one spot order and do not send `execInst`, `execInstruction`, or `instruction`. A present value is refused before the adapter so PostOnly, ReduceOnly, or CloseOnTrigger packed in that field cannot be silently ignored.

Omitted, null, false, and blank pass. Zero is present and is refused. `postOnly`, `reduceOnly`, and `closeOnTrigger` remain their own floors.

This is an instruction floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
