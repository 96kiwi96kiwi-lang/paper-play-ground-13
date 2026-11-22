/** Refuse external intensity metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present intensity, intensityId, or
 * orderIntensity is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach an intensity or narrative tag. An intensity
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

export function orderIntensityReason(
  intensity: unknown,
  intensityId?: unknown,
  orderIntensity?: unknown,
): string | null {
  if (present(intensity)) {
    return "Intensity is not supported; the adapter would place a plain spot order";
  }
  if (present(intensityId)) {
    return "Intensity id is not supported; the adapter would place a plain spot order";
  }
  if (present(orderIntensity)) {
    return "Order-intensity alias is not supported; the adapter would place a plain spot order";
  }
  return null;
}
