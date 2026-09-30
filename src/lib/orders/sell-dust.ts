/** Refuse sells that would leave an unsellable dust remainder. Not a halt. */

export function sellDustRemainderReason(
  side: "buy" | "sell",
  held: number,
  amount: number,
  price: number | undefined,
  minNotionalUsd: number,
): string | null {
  if (side !== "sell") return null;
  if (!(held > 0) || !(amount > 0)) return null;
  if (price == null || !(price > 0) || !Number.isFinite(price)) return null;
  const leftover = held - amount;
  if (leftover <= 1e-12) return null;
  const leftoverNotional = leftover * price;
  if (leftoverNotional + 1e-9 < minNotionalUsd) {
    return `Sell dust: leftover $${leftoverNotional.toFixed(2)} would be below min notional $${minNotionalUsd}`;
  }
  return null;
}
