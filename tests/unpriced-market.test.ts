import { expect, test } from "vitest";
import { marketReferencePrice, unpricedMarketReason } from "@/lib/orders/unpriced-market";

test("a market with no price and no mark is refused", () => {
  expect(unpricedMarketReason("market", undefined, undefined)).toMatch(/Unpriced market/);
  expect(unpricedMarketReason("market", 0, 0)).toMatch(/Unpriced market/);
  expect(unpricedMarketReason("market", -1, Number.NaN)).toMatch(/Unpriced market/);
});

test("a priced market, a mark-only market, and a limit still pass", () => {
  expect(unpricedMarketReason("market", 100, undefined)).toBeNull();
  expect(unpricedMarketReason("market", undefined, 100)).toBeNull();
  expect(unpricedMarketReason("limit", undefined, undefined)).toBeNull();
  expect(unpricedMarketReason("limit", undefined, 100)).toBeNull();
});

test("mark is the notional reference only when the market has no price", () => {
  expect(marketReferencePrice("market", undefined, 42)).toBe(42);
  expect(marketReferencePrice("market", 10, 42)).toBe(10);
  expect(marketReferencePrice("limit", undefined, 42)).toBeUndefined();
  expect(marketReferencePrice("market", 0, 0)).toBeUndefined();
});
