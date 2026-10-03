import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { excessPriceDecimalsReason } from "@/lib/orders/price-precision";

const maxDecimals = TRADING_CONFIG.orders.maxPriceDecimals;

test("whole numbers and prices on the cap pass", () => {
  expect(excessPriceDecimalsReason("limit", 100, maxDecimals)).toBeNull();
  expect(excessPriceDecimalsReason("limit", 0.00000001, maxDecimals)).toBeNull();
  expect(excessPriceDecimalsReason("limit", 64250.125, maxDecimals)).toBeNull();
});

test("a limit price finer than the cap is refused", () => {
  const reason = excessPriceDecimalsReason("limit", 0.000000001, maxDecimals);
  expect(reason).toMatch(/Price precision/);
  expect(reason).toMatch(/8 decimal/);
});

test("market submits and a disabled cap do not refuse", () => {
  expect(excessPriceDecimalsReason("market", 0.000000001, maxDecimals)).toBeNull();
  expect(excessPriceDecimalsReason("limit", 1.5, -1)).toBeNull();
  expect(excessPriceDecimalsReason("limit", undefined, maxDecimals)).toBeNull();
  expect(excessPriceDecimalsReason("limit", Number.NaN, maxDecimals)).toBeNull();
});
