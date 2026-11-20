/** Refuse phase fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present phase, orderPhase,
 * or clientPhase is refused: adapters place one plain spot order and do
 * not attach a phase, so a phase-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderPhaseReason(
  phase: unknown,
  orderPhase?: unknown,
  clientPhase?: unknown,
): string | null {
  if (present(phase)) {
    return "Phase is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPhase)) {
    return "Order phase is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPhase)) {
    return "Client phase is not supported; the adapter would place a plain spot order";
  }
  return null;
}
