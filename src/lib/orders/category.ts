/** Refuse non-spot product labels the spot adapters do not read. Not a halt. */

/**
 * Omitted, null, false, and blank pass. Spot and cash (any case) pass.
 * A present category, productType, or instType that is not spot is refused:
 * adapters place one spot order and do not read a product category, so a
 * linear, inverse, swap, or margin label would be ignored and the base size
 * would trade on the spot book. This is a product floor, not a halt, and
 * does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

function isSpotLabel(value: unknown): boolean {
  const raw = String(value).trim().toUpperCase().replace(/[\s-]+/g, "_");
  return raw === "SPOT" || raw === "CASH";
}

export function categoryReason(
  category: unknown,
  productType?: unknown,
  instType?: unknown,
): string | null {
  if (present(category) && !isSpotLabel(category)) {
    return "Category is not supported; the adapter would place a spot order";
  }
  if (present(productType) && !isSpotLabel(productType)) {
    return "Product type is not supported; the adapter would place a spot order";
  }
  if (present(instType) && !isSpotLabel(instType)) {
    return "Instrument type is not supported; the adapter would place a spot order";
  }
  return null;
}
