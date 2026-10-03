/** Normalize time in force before the adapter. Not a halt. */

export type TimeInForce = "GTC";

/**
 * Trim and uppercase. Omitted, blank, and `GTC` pass.
 * IOC, FOK, GTT, and anything else are refused so the adapter never
 * sees a fill-or-kill that KuCoin would reject, and never rests a
 * limit the caller thought would cancel immediately.
 * This is a shape floor, not a halt.
 */
export function normalizeTimeInForce(raw: unknown): { timeInForce: TimeInForce } | { reason: string } {
  if (raw == null) return { timeInForce: "GTC" };
  const shaped = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  if (shaped === "" || shaped === "GTC") return { timeInForce: "GTC" };
  const shown = shaped || String(raw);
  return { reason: `Unsupported time in force: ${shown}` };
}
