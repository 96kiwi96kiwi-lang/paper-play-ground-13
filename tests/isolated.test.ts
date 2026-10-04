import { expect, test } from "vitest";
import { isolatedReason } from "@/lib/orders/isolated";

test("omitted, null, false, and blank isolated fields pass", () => {
  expect(isolatedReason(undefined)).toBeNull();
  expect(isolatedReason(null, null, null)).toBeNull();
  expect(isolatedReason("", "  ", "")).toBeNull();
  expect(isolatedReason(false, false, false)).toBeNull();
});

test("present isolated or close-position flags are refused and do not halt", () => {
  expect(isolatedReason("ISOLATED")).toBe(
    "Isolated margin is not supported; the adapter would place a spot order",
  );
  expect(isolatedReason(true)).toBe(
    "Isolated margin is not supported; the adapter would place a spot order",
  );
  expect(isolatedReason(undefined, "true")).toBe(
    "Isolated flag is not supported; the adapter would place a spot order",
  );
  expect(isolatedReason(undefined, true)).toBe(
    "Isolated flag is not supported; the adapter would place a spot order",
  );
  expect(isolatedReason(undefined, undefined, true)).toBe(
    "Close position is not supported; the adapter would place a spot order",
  );
  expect(isolatedReason(undefined, undefined, 0)).toBe(
    "Close position is not supported; the adapter would place a spot order",
  );
});
