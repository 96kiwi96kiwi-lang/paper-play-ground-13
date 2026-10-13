/** Refuse margin-asset aliases the spot adapters do not set. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present marginAsset, marginCoin, or
 * mgnCcy is refused: placeLimitOrder / placeMarketOrder do not set a margin
 * asset, so a USDT or coin-margin intent would be ignored and the base size
 * would trade on cash. Zero and "USDT" are present and are refused.
 * settleCcy remains the settlement floor. This is a margin-asset floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function marginAssetReason(
  marginAsset: unknown,
  marginCoin?: unknown,
  mgnCcy?: unknown,
): string | null {
  if (present(marginAsset)) {
    return "Margin asset is not supported; the adapter would place a cash spot order";
  }
  if (present(marginCoin)) {
    return "Margin coin is not supported; the adapter would place a cash spot order";
  }
  if (present(mgnCcy)) {
    return "Margin currency is not supported; the adapter would place a cash spot order";
  }
  return null;
}
