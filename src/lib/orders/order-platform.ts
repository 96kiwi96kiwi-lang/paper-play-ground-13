/** Refuse platform metadata the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present platform, orderPlatform, or
 * clientPlatform is refused: placeLimitOrder / placeMarketOrder place one
 * plain spot order and do not attach a platform. A platform intent would
 * otherwise be dropped and the order would rest or fill as a plain
 * spot order. Zero is present and is refused. This is a metadata floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function orderPlatformReason(
  platform?: unknown,
  orderPlatform?: unknown,
  clientPlatform?: unknown,
): string | null {
  if (present(platform)) {
    return "Platform is not supported; the adapter would place a plain spot order";
  }
  if (present(orderPlatform)) {
    return "Order platform is not supported; the adapter would place a plain spot order";
  }
  if (present(clientPlatform)) {
    return "Client platform is not supported; the adapter would place a plain spot order";
  }
  return null;
}
