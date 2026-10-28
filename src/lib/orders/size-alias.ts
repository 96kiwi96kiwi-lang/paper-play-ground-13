/** Refuse size aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present qty, size, or quantity
 * is refused: adapters place by amount only. An alias would be
 * ignored and the order would use the canonical amount or fail.
 * Zero is present and is refused. This is a size floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function sizeAliasReason(
  qty: unknown,
  size?: unknown,
  quantity?: unknown,
): string | null {
  if (present(qty)) {
    return "Qty alias is not supported; the adapter reads amount";
  }
  if (present(size)) {
    return "Size alias is not supported; the adapter reads amount";
  }
  if (present(quantity)) {
    return "Quantity alias is not supported; the adapter reads amount";
  }
  return null;
}
