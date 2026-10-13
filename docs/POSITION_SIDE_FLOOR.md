# Position-side floor

`positionSideReason` refuses a present `positionSide`, `hedgeMode`, or `positionMode`. Paper and KuCoin adapters place one plain spot order and do not send a futures position side, hedge mode, or position mode, so a long, short, or hedge intent would otherwise be ignored and the base size would trade on the spot book.

Omitted, null, false, and blank pass. Zero, LONG, SHORT, BOTH, and hedge are present and are refused. Trade-side remains its own floor.

This is a position-side floor, not a halt, and does not flatten positions. Vitest: `tests/position-side.test.ts` (no exchange, no secrets).

`OrderManager.submit` calls `positionSideReason` after the trade-side floor and before the adapter. No secrets.
