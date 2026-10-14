# Recv-window floor

`recvWindow` is a client-side request deadline (milliseconds) used by some exchange APIs. The paper and KuCoin spot adapters place one plain spot order and do not forward or honor a recvWindow.

A present `recvWindow` (including zero or "0") is refused before the adapter so the intent is not silently ignored. Omitted, null, false, and blank still pass.

This is a floor, not a halt, and does not flatten positions. It does not count against `maxRejectsInWindow`.

Default mode remains paper. No secrets.
