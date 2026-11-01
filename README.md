# Algo Paper Trader → KuCoin Live Bot

Paper trading simulator with a clear path to **real KuCoin Spot trading**.

> **Default mode is always PAPER.** Live trading requires server-side API keys, a Trade-only permission audit, `OPERATOR_TOKEN` on the server, and explicit confirmation. After every process restart the bot boots in paper again.

**Risk warning:** Live crypto trading can lose all capital in the account. This software does not guarantee profits. Never attach a key that can Withdraw. Use only money you can afford to lose. See [SAFETY.md](./SAFETY.md).

## Current status
**Hour 430 (odd):** Wired order-urgency metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderUrgencyReason` after the order-priority floor and before the paper path: a present `urgency`, `orderUrgency`, or `clientUrgency` is refused (`Urgency is not supported; the adapter would place a plain spot order` / `Order urgency is not supported; the adapter would place a plain spot order` / `Client urgency is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach an urgency, so an urgency-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-urgency.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 429 (odd):** Wired order-priority metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderPriorityReason` after the order-signature floor and before the paper path: a present `priority`, `orderPriority`, or `clientPriority` is refused (`Priority is not supported; the adapter would place a plain spot order` / `Order priority is not supported; the adapter would place a plain spot order` / `Client priority is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a priority, so a priority-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-priority.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 428 (odd):** Wired order-signature metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderSignatureReason` after the order-source floor and before the paper path: a present `signature`, `orderSignature`, or `clientSignature` is refused (`Signature is not supported; the adapter would place a plain spot order` / `Order signature is not supported; the adapter would place a plain spot order` / `Client signature is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a signature, so a signature-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-signature.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

**Hour 427 (odd):** Wired order-source metadata floor into OrderManager. Restored full type-safe OrderManager and `submit` now calls `orderSourceReason` after the order-external floor and before the paper path: a present `source`, `orderSource`, or `src` is refused (`Order source is not supported; the adapter would place a plain spot order` / `Order source alias is not supported; the adapter would place a plain spot order` / `Source alias is not supported; the adapter would place a plain spot order`) and does not burn `maxRejectsInWindow`. Paper and KuCoin adapters place one plain spot order and do not attach a source or partner tag, so a source-tracking intent would otherwise be dropped and the order would rest or fill as a plain spot order. Omitted, null, false, and blank still pass; zero is refused. This is a metadata floor, not a halt, and does not flatten positions. Vitest: `tests/order-source.test.ts` (no exchange, no secrets). Default mode is paper. OrderManager is complete and type-safe.

*(Earlier hours continue the same pattern of wiring floors. Full history is in git.)*

## Architecture

UI → Bot engine → OrderManager → PaperExchange or KuCoin (keys server-side only).

Persist: `data/bot-state.json` (atomic tmp+rename) plus `data/last-reject.json` for the last refused submit.

Health includes halt, alerts, last reject (reason/side/symbol/age), grid books, daily cap, exposure, paper lots, working-order slots, the worker lease, and the optional paper loop.

## Paper / Live

Paper is the default.
Live needs Trade-only KuCoin keys in server `.env`, a permission audit that blocks Withdraw, `OPERATOR_TOKEN`, and typed `ENABLE LIVE`.
A process restart always returns to paper.

Never invent or commit secrets.
See [SAFETY.md](./SAFETY.md).

### Unattended worker startup
The Nitro runtime plugin starts the opt-in paper loop before any HTTP request.

Run `npm run build && npm run test:worker` to verify startup, quote decisions and persisted history with deterministic quotes and no incoming requests.
