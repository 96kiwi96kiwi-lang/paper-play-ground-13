/** Refuse external scenario metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present scenario, scenarioId, or
 * clientScenario is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a scenario or playbook tag. A scenario intent
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

export function orderScenarioReason(
  scenario: unknown,
  scenarioId?: unknown,
  clientScenario?: unknown,
): string | null {
  if (present(scenario)) {
    return "Scenario is not supported; the adapter would place a plain spot order";
  }
  if (present(scenarioId)) {
    return "Scenario id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientScenario)) {
    return "Client scenario is not supported; the adapter would place a plain spot order";
  }
  return null;
}
