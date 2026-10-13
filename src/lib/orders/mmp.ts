/** Refuse market-maker protection the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present mmp, mmpGroup, or
 * marketMakerProtection is refused: placeLimitOrder / placeMarketOrder do not
 * enable market-maker protection, so an MMP flag or group would be ignored and
 * the order could still rest or fill through a protection the caller expected.
 * Zero is present and is refused. priceProtect and slippage remain their own
 * floors. This is a protection floor, not a halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function mmpReason(
  mmp: unknown,
  mmpGroup?: unknown,
  marketMakerProtection?: unknown,
): string | null {
  if (present(mmp)) {
    return "MMP is not supported; the adapter would place a normal spot order";
  }
  if (present(mmpGroup)) {
    return "MMP group is not supported; the adapter would place a normal spot order";
  }
  if (present(marketMakerProtection)) {
    return "Market maker protection is not supported; the adapter would place a normal spot order";
  }
  return null;
}
