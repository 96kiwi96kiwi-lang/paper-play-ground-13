/** Refuse an iceberg or hidden size the adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. True (or any other shape) is refused:
 * placeLimitOrder / placeMarketOrder do not send iceberg, hidden, or visibleSize,
 * so the full amount would rest or fill on the book.
 * A present visible size is refused for the same reason.
 * This is a display floor, not a halt, and does not flatten positions.
 */
export function icebergReason(flag: unknown, visibleSize?: unknown): string | null {
  if (flag != null && flag !== false && !(typeof flag === "string" && flag.trim() === "")) {
    if (flag === true) {
      return "Iceberg is not supported; the adapter would show the full size";
    }
    return "Iceberg must be omitted or false";
  }
  if (visibleSize == null) return null;
  if (typeof visibleSize === "string" && visibleSize.trim() === "") return null;
  return "Visible size is not supported; the adapter would show the full size";
}
