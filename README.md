# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

A submit is refused when `reduceOnly` is true (`Reduce-only is not supported`). Paper and KuCoin adapters do not forward a close-only flag, so a true flag would open or add as a normal order. Omitted and `false` still pass. A non-boolean flag is refused as a bad shape. This runs before the adapter, so it does not burn `maxRejectsInWindow`. This is a close-only floor, not a halt, and does not flatten positions. Vitest: `tests/reduce-only.test.ts` (no exchange, no secrets).

A submit is refused when `postOnly` is true (`Post-only is not supported`). Paper and KuCoin adapters do not forward a maker-only flag, so a true flag would rest or take as a normal order. Omitted and `false` still pass. A non-boolean flag is refused as a bad shape. This runs before the adapter, so it does not burn `maxRejectsInWindow`. This is a maker floor, not a halt, and does not flatten positions. Vitest: `tests/post-only.test.ts` (no exchange, no secrets).

A submit is refused when time in force is not GTC after shape normalization (`Unsupported time in force`). Whitespace is stripped and case is uppercased, so `gtc` and `  Gtc  ` become `GTC`. An omitted or blank value still defaults to GTC. IOC, FOK, GTT, and any other value are refused before the adapter, so a fill-or-kill is not silently rested and a KuCoin reject does not burn `maxRejectsInWindow`. This is a shape floor, not a halt, and does not flatten positions. Vitest: `tests/time-in-force.test.ts` (no exchange, no secrets).

A submit is refused when the order type is not market or limit after shape normalization (`Unsupported order type`). Whitespace is stripped and case is lowercased, so `MARKET` and `  Limit  ` become `market` and `limit`. An omitted or blank type still defaults to market. A stop or other unknown type is refused before the adapter, so it is not silently sent as a market order and does not burn `maxRejectsInWindow`. This is a shape floor, not a halt, and does not flatten positions. Vitest: `tests/order-type.test.ts` (no exchange, no secrets).

A submit is refused when the side is not buy or sell after shape normalization (`Unsupported side`). Whitespace is stripped and case is lowercased, so `BUY` and `  Sell  ` become `buy` and `sell`. A blank or unknown side (`long`) still fails before the adapter, so it does not burn `maxRejectsInWindow`. This is a shape floor, not a halt, and does not flatten positions. Vitest: `tests/side-form.test.ts` (no exchange, no secrets).

A submit is refused when the symbol is not on the configured pair allowlist after shape normalization (`Unsupported pair`). Whitespace is stripped, case is uppercased, and a KuCoin hyphen (`ETH-USDT`) becomes the internal slash form (`ETH/USDT`) when that pair is allowed. An unknown base still fails before the adapter, so it does not burn `maxRejectsInWindow`. This is a shape floor, not a halt, and does not flatten positions. Vitest: `tests/symbol-form.test.ts` (no exchange, no secrets).

A limit submit is refused when the price has more than `orders.maxPriceDecimals` decimal places (default 8) (`Price precision`). KuCoin spot rejects a quote finer than the pair price increment before it rests, which would otherwise count as an adapter reject and burn `maxRejectsInWindow`. Trailing zeros do not count. A whole number and an 8-place price still pass. Market submits skip this floor (no resting price is sent). A missing limit price is not this floor. This is a price floor, not a halt, and does not flatten positions. Vitest: `tests/price-precision.test.ts` (no exchange, no secrets).

A submit is refused when the base amount has more than `orders.maxAmountDecimals` decimal places (default 8) (`Amount precision`). KuCoin spot rejects a size finer than the pair base increment before it rests, which would otherwise count as an adapter reject and burn `maxRejectsInWindow`. Trailing zeros do not count. A whole number and an 8-place size still pass. This is a size floor, not a halt, and does not flatten positions. Vitest: `tests/amount-precision.test.ts` (no exchange, no secrets).

A non-blank `clientOrderId` is refused when it is longer than `orders.maxClientOrderIdLength` (default 40) or outside letters, digits, and hyphens (`Bad clientOrderId`). KuCoin rejects those ids before they rest, which would otherwise count as an adapter reject and burn `maxRejectsInWindow`. Blank and omitted ids still pass, and the duplicate-id floor still runs after this shape check. This is a retry floor, not a halt, and does not flatten positions. Vitest: `tests/client-order-id.test.ts` (no exchange, no secrets).

A market submit is refused when it has neither a positive `price` nor a positive `markPrice` (`Unpriced market`). Without a reference, min/max notional, gross exposure, and `maxPositionPct` were skipped. A market that carries only a mark uses that mark as the notional reference, so those floors still run. A positive `price` still wins over the mark. Strategy ticks already pass `currentPrice`, so they are unchanged. A limit without a price is not this floor (it is still refused later as a missing limit price). This is a sizing floor, not a halt, and does not flatten positions. Vitest: `tests/unpriced-market.test.ts` (no exchange, no secrets).

A limit submit is refused when a same-side working order (open / partial / pending) already rests on that symbol strictly closer than `orders.minRungSpacingPct` (default 0.8%, matching `grid.spacingPct`) (`Tight rung`). The same-price band (0.15%) only stops a near-duplicate; this floor stops a clustered rung that would still pass that band. A limit at exactly the spacing still passes, so the designed adjacent rung is allowed. Market submits skip this floor (no resting price). Opposite side, other symbols, and closed / rejected / canceled rows do not count. Set `orders.blockTightRung` to false to skip it. This is a resting-book floor, not a halt, and does not flatten positions. Vitest: `tests/rung-spacing.test.ts` (no exchange, no secrets).

A limit submit is refused when it would cross or touch the mark (`Cross mark`). A buy limit at or above `markPrice`, and a sell limit at or below it, would take instead of rest, so OrderManager refuses it. A buy below the mark and a sell above it still pass, which is how a grid rung sits. Market submits skip this floor. A missing mark is already refused by the limit-price band. Set `orders.blockCrossMark` to false to skip it. This is a maker floor, not a halt, and does not flatten positions. Vitest: `tests/cross-mark.test.ts` (no exchange, no secrets).

A limit submit is refused when a same-side working order (open / partial / pending) already rests on that symbol within `orders.samePriceBandPct` (default 0.15%) of the new price (`Same price`). A grid retry cannot stack a second buy or sell on the same rung. An adjacent rung still passes: the band sits under `grid.spacingPct` (0.8%). Market submits skip this floor (no resting price). Opposite side, other symbols, and closed / rejected / canceled rows do not count. Set `orders.blockSamePriceWorking` to false to skip it. This is a resting-book floor, not a halt, and does not flatten positions. Vitest: `tests/same-price.test.ts` (no exchange, no secrets).

A submit is refused when an opposite-side working order (open / partial / pending) already rests on the same symbol (`Self-cross`). A buy cannot sit against a working sell, and a sell cannot sit against a working buy, so the book does not cross itself. Same-side adds still pass this floor. Other symbols, and closed / rejected / canceled rows, do not count. Set `orders.blockOppositeWorking` to false to skip it. This is a resting-book floor, not a halt, and does not flatten positions. Vitest: `tests/self-cross.test.ts` (no exchange, no secrets).

See the file history for the full phase table. Default remains paper. Live keys stay on the server. Live mode stays blocked until the operator token is configured and presented.

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).
