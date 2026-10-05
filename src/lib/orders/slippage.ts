/** Refuse slippage fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present maxSlippage, slippage, or
 * slippageTolerance is refused: adapters place the order without a book-move
 * cap, so a protection intent would be ignored and the order could still rest
 * or fill. This is a slippage floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function slippageReason(
  maxSlippage: unknown,
  slippage?: unknown,
  slippageTolerance?: unknown,
): string | null {
  if (present(maxSlippage)) {
    return "Max slippage is not supported; the adapter would place without a book-move cap";
  }
  if (present(slippage)) {
    return "Slippage is not supported; the adapter would place without a book-move cap";
  }
  if (present(slippageTolerance)) {
    return "Slippage tolerance is not supported; the adapter would place without a book-move cap";
  }
  return null;
}
