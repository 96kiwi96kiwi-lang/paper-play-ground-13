/** Refuse external plan metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present plan, planId, or
 * clientPlan is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a plan or playbook tag. A plan intent
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

export function orderPlanReason(
  plan: unknown,
  planId?: unknown,
  clientPlan?: unknown,
): string | null {
  if (present(plan)) {
    return "Plan is not supported; the adapter would place a plain spot order";
  }
  if (present(planId)) {
    return "Plan id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPlan)) {
    return "Client plan is not supported; the adapter would place a plain spot order";
  }
  return null;
}
