import { expect, test } from "vitest";
import { tradeSideReason } from "@/lib/orders/trade-side";

test("omitted, blank, and false pass", () => {
  expect(tradeSideReason(undefined)).toBeNull();
  expect(tradeSideReason(null, null, null)).toBeNull();
  expect(tradeSideReason("", "  ", false)).toBeNull();
  expect(tradeSideReason(false, false, false)).toBeNull();
});

test("a present trade side, hold side, or open type is refused and does not halt", () => {
  expect(tradeSideReason("open")).toBe(
    "Trade side is not supported; the adapter would place a spot order",
  );
  expect(tradeSideReason("close")).toBe(
    "Trade side is not supported; the adapter would place a spot order",
  );
  expect(tradeSideReason(undefined, "long")).toBe(
    "Hold side is not supported; the adapter would place a spot order",
  );
  expect(tradeSideReason(undefined, undefined, "isolated")).toBe(
    "Open type is not supported; the adapter would place a spot order",
  );
  expect(tradeSideReason(undefined, undefined, 0)).toBe(
    "Open type is not supported; the adapter would place a spot order",
  );
});
