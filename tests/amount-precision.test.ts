import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import {
  amountDecimalPlaces,
  excessAmountDecimalsReason,
  floorAmountToDecimals,
} from "@/lib/orders/amount-precision";

const maxDecimals = TRADING_CONFIG.orders.maxAmountDecimals;

test("whole numbers and sizes on the cap pass", () => {
  expect(amountDecimalPlaces(1)).toBe(0);
  expect(amountDecimalPlaces(0.00000001)).toBe(8);
  expect(excessAmountDecimalsReason(0.125, maxDecimals)).toBeNull();
  expect(excessAmountDecimalsReason(0.00000001, maxDecimals)).toBeNull();
  expect(excessAmountDecimalsReason(2, maxDecimals)).toBeNull();
});

test("a size finer than the cap is refused", () => {
  expect(amountDecimalPlaces(1e-9)).toBe(9);
  const reason = excessAmountDecimalsReason(0.000000001, maxDecimals);
  expect(reason).toMatch(/Amount precision/);
  expect(reason).toMatch(/8 decimal/);
});

test("a disabled cap and unusable amounts do not refuse", () => {
  expect(excessAmountDecimalsReason(0.000000001, 0)).toMatch(/Amount precision/);
  expect(excessAmountDecimalsReason(1.5, -1)).toBeNull();
  expect(excessAmountDecimalsReason(Number.NaN, maxDecimals)).toBeNull();
  expect(amountDecimalPlaces(0)).toBeNull();
});

test("computed strategy sizes floor to the cap without increasing exposure", () => {
  const raw = 1_500 / 103;
  const amount = floorAmountToDecimals(raw, maxDecimals);
  expect(amount).toBeLessThanOrEqual(raw);
  expect(amountDecimalPlaces(amount)).toBeLessThanOrEqual(maxDecimals);
  expect(excessAmountDecimalsReason(amount, maxDecimals)).toBeNull();
  expect(floorAmountToDecimals(Number.NaN, maxDecimals)).toBe(0);
});
