/** Refuse external saga metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present saga, sagaId, or
 * clientSaga is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a saga or narrative tag. A saga intent
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

export function orderSagaReason(
  saga: unknown,
  sagaId?: unknown,
  clientSaga?: unknown,
): string | null {
  if (present(saga)) {
    return "Saga is not supported; the adapter would place a plain spot order";
  }
  if (present(sagaId)) {
    return "Saga id is not supported; the adapter would place a plain spot order";
  }
  if (present(clientSaga)) {
    return "Client saga is not supported; the adapter would place a plain spot order";
  }
  return null;
}
