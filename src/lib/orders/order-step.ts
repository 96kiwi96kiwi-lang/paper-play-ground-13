/** Refuse external step metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present step, stepId, or
 * clientStep is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a step or steps tag. A step intent
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

export function orderStepReason(
  step: unknown,
  stepId?: unknown,
  clientStep?: unknown,
): string | null {
  if (present(step)) {
    return "Step is not supported; the adapter would place a plain spot order";
  }
  if (present(stepId)) {
    return "Step id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientStep)) {
    return "Client step is not supported; the adapter would place a plain spot order";
  }
  return null;
}
