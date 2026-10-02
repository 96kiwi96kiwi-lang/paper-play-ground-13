/** Refuse a submit while an opposite-side working order rests on the same symbol. Not a halt. */

type WorkingOrder = {
  id?: string;
  side?: string;
  symbol?: string;
};

/** Buy vs working sell, or sell vs working buy, on one symbol is refused. */
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
