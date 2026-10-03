/** Refuse a limit price finer than the configured decimal cap. Not a halt. */

import { amountDecimalPlaces } from "./amount-precision";

/**
 * A limit price with more than `maxDecimals` places is refused so the adapter
 * never sees a float KuCoin would reject. Whole numbers and prices on the cap
 * pass. Market submits skip this (no resting price is sent). A missing price
 * is not this floor.
 */
export function excessPriceDecimalsReason(
  type: "market" | "limit",
  price: number | undefined,
  maxDecimals: number,
): string | null {
  if (type !== "limit") return null;
  if (!(maxDecimals >= 0) || !Number.isInteger(maxDecimals)) return null;
  if (!(price != null) || !(price > 0) || !Number.isFinite(price)) return null;
  const places = amountDecimalPlaces(price);
  if (places == null || places <= maxDecimals) return null;
  return `Price precision: more than ${maxDecimals} decimal places`;
}
