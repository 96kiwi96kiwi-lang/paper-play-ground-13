/** Refuse buys that would leave book cash below the configured sleeve. Not a halt. */

export function cashReserveBuyReason(
  side: "buy" | "sell",
  cash: number,
  notional: number | undefined,
  reserveUsd: number,
): string | null {
  if (side !== "buy") return null;
  if (!Number.isFinite(cash)) return "Cash reserve: book cash is not finite";
  if (notional == null || !Number.isFinite(notional)) {
    if (cash < reserveUsd + 10) {
      return `Cash reserve floor ($${reserveUsd}) — book cash $${cash.toFixed(2)}`;
    }
    return null;
  }
  const leftover = cash - notional;
  if (leftover + 1e-9 < reserveUsd) {
    return `Cash reserve: leftover $${leftover.toFixed(2)} would breach $${reserveUsd}`;
  }
  return null;
}
