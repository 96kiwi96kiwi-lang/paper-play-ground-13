/** Refuse a buy that would open a new name past the open-slot cap. Not a halt. */

const WORKING = new Set(["pending", "open", "partially_filled"]);

type SlotPosition = { amount?: number };
type SlotOrder = { symbol?: string; side?: string; status?: string };

function isWorkingBuy(order: SlotOrder): boolean {
  return order.side === "buy" && WORKING.has(String(order.status ?? ""));
}

/**
 * Names already consuming an open slot: held inventory, plus symbols with a
 * working buy that have not filled yet. Rejects and cancels are not slots.
 */
export function openSlotSymbols(
  positions: Record<string, SlotPosition>,
  working: SlotOrder[],
  dust = 1e-8,
): string[] {
  const slots = new Set<string>();
  for (const [symbol, pos] of Object.entries(positions)) {
    if (symbol && (pos?.amount ?? 0) > dust) slots.add(symbol);
  }
  for (const order of working) {
    if (order.symbol && isWorkingBuy(order)) slots.add(order.symbol);
  }
  return [...slots].sort();
}

export function openSlotReason(
  side: "buy" | "sell",
  symbol: string,
  slots: string[],
  cap: number,
): string | null {
  if (side !== "buy") return null;
  if (!(cap > 0)) return null;
  if (slots.includes(symbol)) return null;
  const used = slots.length;
  if (used >= cap) {
    return `Open slots: ${used}/${cap} names already held or reserved — ${symbol} would be a new position`;
  }
  return null;
}
