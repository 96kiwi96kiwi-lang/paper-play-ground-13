/** Refuse futures leverage the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present leverage, isolated flag, or
 * margin mode is refused: placeLimitOrder / placeMarketOrder do not send those
 * fields, so a leveraged or isolated intent would trade on the cash spot book
 * at the base size. Any positive leverage, true isolated, or cross/isolated
 * mode is present and is refused. Zero leverage is refused. This is a product
 * floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  if (typeof value === "number" && value === 0) return true; // zero is refused
  return true;
}

export function leverageReason(
  leverage: unknown,
  isolated?: unknown,
  marginMode?: unknown,
): string | null {
  if (present(leverage)) {
    return "Leverage is not supported; the adapter would place a spot order";
  }
  if (present(isolated)) {
    return "Isolated margin is not supported; the adapter would place a spot order";
  }
  if (present(marginMode)) {
    return "Margin mode is not supported; the adapter would place a spot order";
  }
  return null;
}
