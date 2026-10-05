/** Refuse exchange price-band fields the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present priceProtect, priceProtection,
 * or percentPrice is refused: adapters place the order without an exchange
 * price band, so a protect intent would be ignored and the order could still
 * rest or fill outside that band. This is a price-protect floor, not a halt,
 * and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function priceProtectReason(
  priceProtect: unknown,
  priceProtection?: unknown,
  percentPrice?: unknown,
): string | null {
  if (present(priceProtect)) {
    return "Price protect is not supported; the adapter would place without an exchange price band";
  }
  if (present(priceProtection)) {
    return "Price protection is not supported; the adapter would place without an exchange price band";
  }
  if (present(percentPrice)) {
    return "Percent price is not supported; the adapter would place without an exchange price band";
  }
  return null;
}
