/** Refuse external choice metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present choice, choiceId, or
 * orderChoice is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a choice or narrative tag. A choice
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

export function orderChoiceReason(
  choice: unknown,
  choiceId?: unknown,
  orderChoice?: unknown,
): string | null {
  if (present(choice)) {
    return "Choice is not supported; the adapter would place a plain spot order";
  }
  if (present(choiceId)) {
    return "Choice id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderChoice)) {
    return "Order-choice alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
