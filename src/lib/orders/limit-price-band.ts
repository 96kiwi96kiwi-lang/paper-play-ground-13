/** Refuse limit submits priced too far from the last mark. Not a halt. */

export function limitDeviationPct(
  limitPrice: number | undefined,
  markPrice: number | undefined,
): number | null {
  if (limitPrice == null || markPrice == null) return null;
  if (!Number.isFinite(limitPrice) || !Number.isFinite(markPrice)) return null;
  if (!(limitPrice > 0) || !(markPrice > 0)) return null;
  return (Math.abs(limitPrice - markPrice) / markPrice) * 100;
}

export function limitPriceBandReason(
  type: string | undefined,
  limitPrice: number | undefined,
  markPrice: number | undefined,
  maxDeviationPct: number,
): string | null {
  if ((type ?? "market") !== "limit") return null;
  if (!(maxDeviationPct > 0)) return null;
  if (markPrice == null || !Number.isFinite(markPrice) || !(markPrice > 0)) {
    return "Limit band: limit submit requires a positive markPrice";
  }
  if (limitPrice == null || !Number.isFinite(limitPrice) || !(limitPrice > 0)) {
    return "Limit band: limit submit requires a positive price";
  }
  const pct = limitDeviationPct(limitPrice, markPrice);
  if (pct == null || pct <= maxDeviationPct) return null;
  return `Limit band: price ${limitPrice} is ${pct.toFixed(2)}% from mark ${markPrice} (max ${maxDeviationPct}%)`;
}
