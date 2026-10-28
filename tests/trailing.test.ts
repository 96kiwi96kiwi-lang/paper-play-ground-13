import { expect, test } from "vitest";
import { trailingReason } from "@/lib/orders/trailing";

test("omitted, blank, and false pass", () => {
  expect(trailingReason(undefined)).toBeNull();
  expect(trailingReason(null, null, null, null)).toBeNull();
  expect(trailingReason("", "  ", false, "")).toBeNull();
  expect(trailingReason(false, false, false, false)).toBeNull();
});

test("a present trailing field is refused and does not halt", () => {
  expect(trailingReason(true)).toBe(
    "Trailing stop is not supported; the adapter would place a plain spot order",
  );
  expect(trailingReason(0)).toBe(
    "Trailing stop is not supported; the adapter would place a plain spot order",
  );
  expect(trailingReason(undefined, 50)).toBe(
    "Trailing delta is not supported; the adapter would place a plain spot order",
  );
  expect(trailingReason(undefined, undefined, 0.5)).toBe(
    "Callback rate is not supported; the adapter would place a plain spot order",
  );
  expect(trailingReason(undefined, undefined, undefined, 100)).toBe(
    "Activation price is not supported; the adapter would place a plain spot order",
  );
});
