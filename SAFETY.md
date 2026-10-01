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
- [ ] On halt in LIVE mode the server cancels visible open orders (does not market-dump positions)
- [ ] On halt in PAPER mode persisted working orders are marked canceled on disk (positions stay)
- [ ] You know how to inspect `data/bot-state.json` and server logs after a halt
- [ ] Optional `HARD_STOP_WEBHOOK_URL` is set if you want an external ping
- [ ] You will not clear a halt without reviewing why it fired
- [ ] Resume only via `clearOperatorHalt()` after presenting `OPERATOR_TOKEN` — do not just delete `haltReason` from the JSON; `lastHardStop.reason` used to restore it
- [ ] Health reports last tick age; a stale heartbeat (no tick for ~135s) fails health and fires a watchdog alert
- [ ] `minCashReserveUsd` is sized so buys cannot empty the account cash sleeve
- [ ] `maxDailyTrades` (12) and `maxDailyTradesPerSymbol` (5) match how much churn you will allow before OrderManager refuses
- [ ] `maxDailySellNotionalUsd` (6,000) and `maxDailySellNotionalPerSymbolUsd` (2,500) match how much inventory you will allow OrderManager to sell in one UTC day (not a halt; does not flatten)
- [ ] `maxHourlyBuyNotionalUsd` (1,500) and `maxHourlyBuyNotionalPerSymbolUsd` (800) match how much you will allow OrderManager to buy inside a rolling 60 minutes (not a halt; sells still allowed)
- [ ] `maxWorkingNotionalUsd` (5,000) is sized so resting open / partial / pending orders cannot stack past that sleeve
- [ ] `maxWorkingNotionalPerSymbolUsd` (2,500) is sized so one pair cannot rest the whole working-notional sleeve
- [ ] Only one process holds `data/worker-lease.json`; a second replica stays standby until the lease expires
- [ ] `PAPER_SERVER_LOOP=1` is paper-only housekeeping (heartbeat + grid TTL). It does not place live orders or invent quotes. Leave it off unless you want a server-owned heartbeat.

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
