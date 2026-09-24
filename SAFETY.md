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

## Confirmation path

- [ ] Paper mode has been run long enough that strategies and risk limits behave as expected
- [ ] Dashboard live switch requires typing `ENABLE LIVE`
- [ ] Server reports `hasCredentials: true` without returning secret values
- [ ] After a process restart the bot boots in **paper** again (live must be re-confirmed)

## Risk hard-stops

- [ ] Daily loss limit, max drawdown, and losing streak will halt the bot
- [ ] On halt in LIVE mode the server cancels visible open orders (does not market-dump positions)
- [ ] You know how to inspect `data/bot-state.json` and server logs after a halt
- [ ] Optional `HARD_STOP_WEBHOOK_URL` is set if you want an external ping
- [ ] You will not clear `haltReason` without reviewing why it fired

## Capital

- [ ] Only funds you can afford to lose are on the exchange account used by this bot
- [ ] Position size / daily loss / drawdown numbers in `src/config/trading.ts` match your tolerance
- [ ] You accept that market gaps, partial fills, and outages can still lose money inside those limits

## Operational

- [ ] You can stop the process quickly
- [ ] You will monitor the first live session in real time
- [ ] You understand this software is provided as-is; there is no guarantee of profit

If any box is unchecked, stay in paper mode.
