/** Refuse leverage or margin flags the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. A present leverage or margin mode is refused:
 * placeLimitOrder / placeMarketOrder do not send those fields, so the order
 * would trade on the spot book at the base size. tradeType may be TRADE or
 * SPOT; anything else (MARGIN_TRADE, margin) is refused. marginTrade and
 * isMargin are refused when present; false still passes. Zero is present.
 * This is a product floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

function presentFlag(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function spotOnlyReason(
  leverage: unknown,
  marginMode?: unknown,
  tradeType?: unknown,
  marginTrade?: unknown,
  isMargin?: unknown,
): string | null {
  if (present(leverage)) {
    return "Leverage is not supported; the adapter would place a spot order";
  }
  if (present(marginMode)) {
    return "Margin mode is not supported; the adapter would place a spot order";
  }
  if (present(tradeType)) {
    const raw = String(tradeType).trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (raw !== "TRADE" && raw !== "SPOT") {
      return "Trade type is not supported; the adapter would place a spot order";
    }
  }
  if (presentFlag(marginTrade)) {
    return "Margin trade is not supported; the adapter would place a spot order";
  }
  if (presentFlag(isMargin)) {
    return "Margin flag is not supported; the adapter would place a spot order";
  }
  return null;
}
