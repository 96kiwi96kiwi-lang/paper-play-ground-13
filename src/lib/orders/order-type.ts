/** Normalize an order type to market or limit before the adapter. Not a halt. */

export type OrderType = "market" | "limit";

/**
 * Trim and lowercase. Omitted, blank, `market`, and `limit` pass.
 * Anything else is refused so the adapter never sees a stop or unknown
 * type. Without this floor, a non-limit string was sent as a market order,
 * which would also burn the reject-burst window on a KuCoin reject.
 * This is a shape floor, not a halt.
 */
export function normalizeOrderType(raw: unknown): { type: OrderType } | { reason: string } {
  if (raw == null) return { type: "market" };
  if (typeof raw !== "string") return { reason: `Unsupported order type: ${String(raw)}` };
  const shaped = raw.trim().toLowerCase();
  if (shaped === "" || shaped === "market") return { type: "market" };
  if (shaped === "limit") return { type: "limit" };
  const shown = shaped || String(raw);
  return { reason: `Unsupported order type: ${shown}` };
}
