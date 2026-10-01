import { expect, test } from "vitest";
import { limitDeviationPct, limitPriceBandReason } from "@/lib/orders/limit-price-band";

const MAX = 2.5;

test("market submits skip the band", () => {
  expect(limitPriceBandReason("market", 1, undefined, MAX)).toBeNull();
  expect(limitPriceBandReason(undefined, 50, 100, MAX)).toBeNull();
});

test("limit inside the band is allowed", () => {
  expect(limitDeviationPct(101, 100)).toBeCloseTo(1);
  expect(limitPriceBandReason("limit", 101, 100, MAX)).toBeNull();
  expect(limitPriceBandReason("limit", 97.6, 100, MAX)).toBeNull();
});

test("limit beyond the band is refused either side", () => {
  const high = limitPriceBandReason("limit", 103, 100, MAX);
  expect(high).toMatch(/Limit band/);
  expect(high).toMatch(/3\.00%/);
  expect(high).toMatch(/max 2\.5%/);
  const low = limitPriceBandReason("limit", 97, 100, MAX);
  expect(low).toMatch(/3\.00%/);
});

test("missing or non-positive mark is refused", () => {
  expect(limitPriceBandReason("limit", 100, undefined, MAX)).toMatch(/positive markPrice/);
  expect(limitPriceBandReason("limit", 100, 0, MAX)).toMatch(/positive markPrice/);
  expect(limitPriceBandReason("limit", 100, Number.NaN, MAX)).toMatch(/positive markPrice/);
});

test("missing limit price is refused", () => {
  expect(limitPriceBandReason("limit", undefined, 100, MAX)).toMatch(/positive price/);
  expect(limitPriceBandReason("limit", -1, 100, MAX)).toMatch(/positive price/);
});

test("zero max disables the floor", () => {
  expect(limitPriceBandReason("limit", 500, 100, 0)).toBeNull();
});
