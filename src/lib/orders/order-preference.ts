/** Refuse external preference metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present preference, preferenceId, or
 * orderPreference is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a preference or narrative tag. A preference
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

export function orderPreferenceReason(
  preference: unknown,
  preferenceId?: unknown,
  orderPreference?: unknown,
): string | null {
  if (present(preference)) {
    return "Preference is not supported; the adapter would place a plain spot order";
  }
  if (present(preferenceId)) {
    return "Preference id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPreference)) {
    return "Order-preference alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
