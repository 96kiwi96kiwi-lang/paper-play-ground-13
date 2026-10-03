/** Normalize a side to buy or sell before the adapter. Not a halt. */

import type { Side } from "@/lib/exchange/types";

/**
 * Trim and lowercase. Only `buy` and `sell` pass.
 * Anything else is refused so the adapter never sees a side KuCoin would
 * reject (which would burn the reject-burst window). This is a shape floor,
 * not a halt.
 */
export function normalizeOrderSide(raw: unknown): { side: Side } | { reason: string } {
  const shaped = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (shaped === "buy" || shaped === "sell") return { side: shaped };
  const shown = shaped || (raw == null ? "" : String(raw));
  return { reason: `Unsupported side: ${shown || "(blank)"}` };
}
