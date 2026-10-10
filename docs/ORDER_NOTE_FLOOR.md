# Order note floor

A submit is refused when `note`, `orderNote`, or `clientNote` is present (`Order note is not supported` / `Order note alias is not supported` / `Client note alias is not supported`).

Paper and KuCoin adapters place one plain spot order and do not forward a note, so a note intent would be ignored and the base size would rest or fill as a plain spot order.

Omitted, null, false, and blank still pass. Zero is present and is refused.

`OrderManager.submit` calls `orderNoteReason` before the adapter, so a refuse does not burn `maxRejectsInWindow`. This is a metadata floor, not a halt, and does not flatten positions.

Vitest: `tests/order-note.test.ts` (no exchange, no secrets).
