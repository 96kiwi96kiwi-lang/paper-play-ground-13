/** Refuse size aliases the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, and blank pass. A present size, quantity, qty, or baseSize
 * is refused: placeLimitOrder / placeMarketOrder size by amount only, so a
 * size alias would be ignored and the base amount would trade. Zero is
 * present and is refused. This is a sizing floor, not a halt, and does not
 * flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function baseSizeReason(
  size: unknown,
  quantity?: unknown,
  qty?: unknown,
  baseSize?: unknown,
): string | null {
  if (present(size)) {
    return "Size is not supported; the adapter sizes by amount";
  }
  if (present(quantity)) {
    return "Quantity is not supported; the adapter sizes by amount";
  }
  if (present(qty)) {
    return "Qty is not supported; the adapter sizes by amount";
  }
  if (present(baseSize)) {
    return "Base size is not supported; the adapter sizes by amount";
  }
  return null;
}
