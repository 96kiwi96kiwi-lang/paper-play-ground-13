/** Refuse a buy that averages down too far under the open entry. Not a halt. */

/**
 * A buy on a symbol that already has inventory is refused when the mark is at
 * least maxPct under average entry. Sells, flat names, and submits without a
 * positive mark are unchanged. Rejects nothing that would flatten a position.
 */
export function averageDownReason(
  side: "buy" | "sell",
  symbol: string,
  held: number,
  avgEntry: number,
  mark: number | undefined,
  maxPct: number,
): string | null {
  if (side !== "buy") return null;
  if (!(maxPct > 0)) return null;
  if (!(held > 1e-12) || !(avgEntry > 0)) return null;
  if (mark == null || !(mark > 0)) return null;
  const underPct = ((avgEntry - mark) / avgEntry) * 100;
  if (underPct + 1e-9 >= maxPct) {
    return `Average down (${symbol}): mark is ${underPct.toFixed(2)}% under entry ${avgEntry} (max ${maxPct}%)`;
  }
  return null;
}
