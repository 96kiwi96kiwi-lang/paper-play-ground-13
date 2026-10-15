# Live trading safety checklist

Complete every item before switching from paper to live. Default mode is paper. Live is opt-in only.

## Credentials (server only)

- [ ] KuCoin API key created with **Trade** permission only
- [ ] **Withdraw is disabled** on that key
- [ ] IP restriction enabled on the key when possible
- [ ] Keys live in `.env` / hosting secrets — never in the repo, frontend, or LocalStorage
- [ ] `.env` is gitignored; only `.env.example` is committed
- [ ] You can rotate/revoke the key immediately if it leaks
- [ ] Enabling LIVE runs a server-side permission audit; Withdraw on the key blocks live
- [ ] If audit cannot read permissions, live stays blocked unless you set `KUCOIN_ALLOW_UNVERIFIED_KEY=1` after a manual check
- [ ] `OPERATOR_TOKEN` is set on the server (your value, not from this repo) before live or halt-clear

## Confirmation path

- [ ] Paper mode has been run long enough that strategies and risk limits behave as expected
- [ ] Dashboard live switch requires typing `ENABLE LIVE`
- [ ] Server reports `hasCredentials: true` without returning secret values
- [ ] After a process restart the bot boots in **paper** again (live must be re-confirmed)
- [ ] Enable-live and clear-halt reject requests that omit or mismatch `OPERATOR_TOKEN`

## Risk hard-stops

- [ ] Daily loss limit, max drawdown, and losing streak will halt the bot
- [ ] Price gap hard-stop uses `risk.priceGapLimitPct` (default 3.5%) from config; a relative jump vs last tick at or above that limit halts the bot
- [ ] On halt in LIVE mode the server cancels visible open orders (does not market-dump positions)
- [ ] On halt in PAPER mode persisted working orders are marked canceled on disk (positions stay)
- [ ] You know how to inspect `data/bot-state.json` and server logs after a halt
- [ ] Optional `HARD_STOP_WEBHOOK_URL` is set if you want an external ping
- [ ] You will not clear a halt without reviewing why it fired
- [ ] Resume only via `clearOperatorHalt()` after presenting `OPERATOR_TOKEN` — do not just delete `haltReason` from the JSON; `lastHardStop.reason` used to restore it
- [ ] Health reports last tick age; a stale heartbeat (no tick for ~135s) fails health and fires a watchdog alert
- [ ] A present `cancelOnDisconnect`, `deadman`, or `cod` is refused before the adapter (not a halt; omitted, false, and blank still pass; adapters do not arm a cancel-on-disconnect timer, so a dead-man intent would leave a resting order live after the process drops)
- [ ] A present `grid`, `gridId`, or `algoId` is refused before the adapter (not a halt; omitted, false, and blank still pass; adapters place one plain spot order and do not attach a grid, so a grid intent would otherwise be ignored and the base size would trade)
- [ ] A present `closePosition`, `closeOnTrigger`, or `closeOrder` is refused before the adapter (not a halt; omitted, false, and blank still pass; adapters place one plain spot order and do not send a close flag, so a close intent would otherwise be ignored and the base amount would still trade as a normal spot order)
- [ ] A present `reduceOnly` is refused before the adapter (not a halt; omitted, null, and false still pass; adapters place one plain spot order and do not send a reduce-only flag, so a reduce-only intent would otherwise be ignored and the order could open or add instead of only closing)
- [ ] A non-GTC `timeInForce` or present `tif` / `timeInForceAlias` / `immediateOrCancel` / `fillOrKill` is refused before the adapter (not a halt; omitted, null, false, blank, and GTC still pass; adapters place one plain spot order as GTC and do not forward IOC/FOK, so a non-GTC intent would otherwise be ignored and the order would rest)
- [ ] A present `isMargin`, `margin`, or `is_margin` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; adapters place one plain spot order and do not open a margin account, so a margin intent would otherwise be ignored and the base size would trade on cash)
- [ ] A present `isLeverage`, `leverageFlag`, or `marginLeverage` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; adapters place one plain spot order and do not send a margin-leverage flag, so a borrow-on-spot intent would otherwise be ignored and the base size would trade on cash)
- [ ] A present `marginAsset`, `marginCoin`, or `mgnCcy` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; adapters place one plain spot order and do not set a margin asset, so a USDT or coin-margin intent would otherwise be ignored and the base size would trade on cash)
- [ ] A present `tradeSide`, `holdSide`, or `openType` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; adapters place one plain spot order and do not send a futures trade side, so an open-long or close-short intent would otherwise be ignored and the base amount would still trade on the spot book)
- [ ] A present `positionSide`, `hedgeMode`, or `positionMode` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; adapters place one plain spot order and do not send a futures position side, hedge mode, or position mode, so a long, short, or hedge intent would otherwise be ignored and the base size would trade on the spot book)
- [ ] A present `leverage`, `isolated`, or `marginMode` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not send a leverage, isolated flag, or margin mode, so a leveraged or isolated intent would otherwise be ignored and the base size would trade on the cash spot book)
- [ ] A present `autoBorrow` or `autoRepay` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; adapters place one plain spot order and do not send a borrow or repay flag, so an auto-borrow or auto-repay intent would otherwise be ignored and the base size would trade on the cash spot book without borrowing or repaying margin)
- [ ] A present `attachAlgoOrds`, `tpTriggerPx`, or `slTriggerPx` is refused before the adapter (not a halt; omitted, null, false, blank, and empty list still pass; zero is refused; adapters place one plain spot order and do not attach a take-profit or stop-loss algo, so a bracket intent would otherwise be ignored and the base size would trade)
- [ ] A present `brokerId`, `brokerClientId`, or `rebate` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not send a broker or rebate field, so an expected partner split would otherwise be ignored and the order would still rest or fill on the server key account)
- [ ] A present `stopPrice`, `triggerPrice`, or `stopPx` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not send a stop trigger, so a stop or trigger intent would otherwise be ignored and the order would rest or fill as a plain spot order)
- [ ] A present `trailingStop`, `trailingDelta`, `callbackRate`, or `activationPrice` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not send a trailing callback or activation, so a trailing intent would otherwise be ignored and the order would rest or fill as a plain spot order)
- [ ] A present `quoteQty`, `quoteOrderQty`, or `notional` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order using the base amount and do not interpret a quote size, so a quote-quantity intent would otherwise be ignored and the base amount would trade)
- [ ] A present `funds`, `quoteFunds`, or `fundsAmount` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order using the base amount and do not interpret a quote funds value, so a funds intent would otherwise be ignored and the base amount would trade)
- [ ] A present `tpTriggerBy`, `slTriggerBy`, or `triggerPxType` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not price a take-profit or stop-loss off last, mark, or index, so a mark or index stop intent would otherwise be ignored and the base size would rest or fill immediately)
- [ ] A present `recvWindow` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not honor a client deadline, so a recvWindow intent would otherwise be ignored and the base size would rest or fill immediately)
- [ ] A present `sideEffectType`, `sideEffect`, or `marginEffect` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero and NO_SIDE_EFFECT are refused; adapters place one plain spot order and do not send a margin side-effect, so a MARGIN_BUY or AUTO_REPAY intent would otherwise be ignored and the base size would trade on the spot book)
- [ ] A present `test`, `dryRun`, or `validateOnly` is refused before the adapter (not a halt; omitted, null, false, and blank still pass; zero is refused; adapters place one plain spot order and do not honor a test, dry-run, or validate-only flag, so a rehearsal intent would otherwise be ignored and the base size would rest or fill for real)
- [ ] Only one process holds `data/worker-lease.json`; a second replica stays standby until the lease expires
- [ ] `PAPER_SERVER_LOOP=1` is a paper-only market loop. It accepts only fresh provider-timestamped public quotes, runs strategy/risk/order gates, and cannot call the live adapter. Leave it off unless the server worker should own paper decisions.

## Capital

- [ ] Only funds you can afford to lose are on the exchange account used by this bot
- [ ] Position size / daily loss / drawdown numbers in `src/config/trading.ts` match your tolerance
- [ ] You accept that market gaps, partial fills, and outages can still lose money inside those limits

## Operational

- [ ] You can stop the process quickly
- [ ] You will monitor the first live session in real time
- [ ] Tick host calls `markBotTick` / `markBotTickFn` so the watchdog can see a dead loop
- [ ] You understand this software is provided as-is; there is no guarantee of profit

If any box is unchecked, stay in paper mode.
