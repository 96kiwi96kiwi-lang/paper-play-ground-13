/** Refuse risk aliases the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, and blank pass. A present risk, orderRisk, or baseRisk is
 * refused: adapters place by amount only. An alias would be ignored and the
 * order would use the canonical amount or fail. This is a risk floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function riskAliasReason(
  risk: unknown,
  orderRisk?: unknown,
  baseRisk?: unknown,
): string | null {
  if (present(risk)) {
    return "Risk alias is not supported; the adapter reads amount";
  }
  if (present(orderRisk)) {
    return "Order risk alias is not supported; the adapter reads amount";
  }
  if (present(baseRisk)) {
    return "Base risk alias is not supported; the adapter reads amount";
  }
  return null;
}
