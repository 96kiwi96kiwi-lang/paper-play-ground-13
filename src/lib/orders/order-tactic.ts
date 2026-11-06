/** Refuse external tactic metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present tactic, tacticId, or
 * clientTactic is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a tactic or playbook tag. A tactic intent
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

export function orderTacticReason(
  tactic: unknown,
  tacticId?: unknown,
  clientTactic?: unknown,
): string | null {
  if (present(tactic)) {
    return "Tactic is not supported; the adapter would place a plain spot order";
  }
  if (present(tacticId)) {
    return "Tactic id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientTactic)) {
    return "Client tactic is not supported; the adapter would place a plain spot order";
  }
  return null;
}
