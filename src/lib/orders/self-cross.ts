/** Refuse a submit while an opposite-side working order rests on the same symbol. Not a halt. */

type WorkingOrder = {
  id?: string;
  side?: string;
  symbol?: string;
};

/**
 * A buy is refused when a working sell already exists on that symbol, and a
 * sell is refused when a working buy exists. Same-side adds, other symbols,
 * and an empty working book still pass. Closed rows are not in `working`.
 */
export function selfCrossReason(
  side: "buy" | "sell",
  symbol: string,
  working: WorkingOrder[],
  block: boolean,
): string | null {
  if (!block) return null;
  const opposite = side === "buy" ? "sell" : "buy";
  const hit = working.find((order) => order.symbol === symbol && order.side === opposite);
  if (!hit) return null;
  const id = hit.id ? ` ${hit.id}` : "";
  return `Self-cross (${symbol}): working ${opposite}${id} still open`;
}
