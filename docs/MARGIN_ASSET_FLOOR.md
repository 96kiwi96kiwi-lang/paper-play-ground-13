# Margin-asset floor

`marginAssetReason` refuses a present `marginAsset`, `marginCoin`, or `mgnCcy`. Paper and KuCoin adapters place one plain spot order and do not set a margin asset, so a USDT or coin-margin intent would otherwise be ignored and the base size would trade on cash.

Omitted, null, false, and blank pass. Zero and `USDT` are present and are refused. `settleCcy`, `settleCoin`, and `quoteCoin` remain the settlement floor.

This is a margin-asset floor, not a halt, and does not flatten positions. Vitest: `tests/margin-asset.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `marginAssetReason` before the adapter. No secrets.
