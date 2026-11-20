/** Refuse external scheme metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present scheme, schemeId, or
 * clientScheme is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a scheme or playbook tag. A scheme intent
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

export function orderSchemeReason(
  scheme: unknown,
  schemeId?: unknown,
  clientScheme?: unknown,
): string | null {
  if (present(scheme)) {
    return "Scheme is not supported; the adapter would place a plain spot order";
  }
  if (present(schemeId)) {
    return "Scheme id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientScheme)) {
    return "Client scheme is not supported; the adapter would place a plain spot order";
  }
  return null;
}
