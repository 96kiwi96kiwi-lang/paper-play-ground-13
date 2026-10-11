# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status

**Hour 7 (odd):** Restored a functional OrderManager (previous commits left `order-manager.ts` as a placeholder). `submit` calls `orderPriorityReason` before the adapter: a present `priority`, `orderPriority`, or `timePriority` is refused (`Order priority is not supported` / alias messages) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not set a priority. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-priority.test.ts` (no exchange, no secrets). Default mode is paper.

**Hour 5 (odd):** Documented the order priority floor after earlier restore attempts. A submit is refused when `priority`, `orderPriority`, or `timePriority` is present. Paper remains the default.

(See the repository history for the complete list of floors, architecture, and prior status paragraphs. Default remains paper. Live keys stay on the server.)

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default. Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`. A process restart always returns to paper.

Never invent or commit secrets. See [SAFETY.md](./SAFETY.md).

### Unattended worker startup
The Nitro runtime plugin starts the opt-in paper loop before any HTTP request.
Run `npm run build && npm run test:worker` to verify startup, quote decisions and persisted history with deterministic quotes and no incoming requests.
A Railway worker still requires a persistent volume at `/app/data`; build success alone does not prove production persistence.
