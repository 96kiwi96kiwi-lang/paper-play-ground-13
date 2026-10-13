# Grid-id floor

Paper and KuCoin adapters place one plain spot order and do not attach a grid or algo. A present `grid`, `gridId`, or `algoId` is refused before the adapter so a grid intent cannot be silently ignored and the base size would trade.

Omitted, null, false, and blank pass. Zero is present and is refused.

This is a grid floor, not a halt, and does not flatten positions. A refuse does not burn `maxRejectsInWindow`. No secrets.
