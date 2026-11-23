/** Refuse external option metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present option, optionId, or
 * orderOption is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an option or narrative tag. An option
 * would otherwise be dropped and the order would rest or fill as a plain spot
 * order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderOptionReason(
  option: unknown,
  optionId?: unknown,
  orderOption?: unknown,
): string | null {
  if (present(option)) {
    return "Option is not supported; the adapter would place a plain spot order";
  }
  if (present(optionId)) {
    return "Option id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderOption)) {
    return "Order-option alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
