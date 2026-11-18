/** Refuse step fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present step, orderStep,
 * or clientStep is refused: adapters place one plain spot order and do
 * not attach a step, so a step-tracking intent would otherwise be
 * dropped and the order would rest or fill as a plain spot order. This is a
 * metadata floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderStepReason(
  step: unknown,
  orderStep?: unknown,
  clientStep?: unknown,
): string | null {
  if (present(step)) {
    return "Step is not supported; the adapter would place a plain spot order";
  }
  if (present(orderStep)) {
    return "Order step is not supported; the adapter would place a plain spot order";
  }
  if (present(clientStep)) {
    return "Client step is not supported; the adapter would place a plain spot order";
  }
  return null;
}
