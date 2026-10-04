import { expect, test } from "vitest";
import { trailingReason } from "@/lib/orders/trailing";

test("omitted, null, and blank trailing fields pass", () => {
  expect(trailingReason(undefined)).toBeNull();
  expect(trailingReason(null, null, null, null, null, null, null)).toBeNull();
  expect(trailingReason("", "  ", "", "", "", "", "")).toBeNull();
});

test("present trailing or trigger fields are refused and do not halt", () => {
  expect(trailingReason(100)).toBe(
    "Trigger price is not supported; the adapter would place a spot order",
  );
  expect(trailingReason(undefined, 90)).toBe(
    "Stop loss is not supported; the adapter would place a spot order",
  );
  expect(trailingReason(undefined, undefined, 110)).toBe(
    "Take profit is not supported; the adapter would place a spot order",
  );
  expect(trailingReason(undefined, undefined, undefined, 5)).toBe(
    "Trailing delta is not supported; the adapter would place a spot order",
  );
  expect(trailingReason(undefined, undefined, undefined, undefined, 1)).toBe(
    "Trailing percent is not supported; the adapter would place a spot order",
  );
  expect(trailingReason(undefined, undefined, undefined, undefined, undefined, 0.5)).toBe(
    "Callback rate is not supported; the adapter would place a spot order",
  );
  expect(trailingReason(undefined, undefined, undefined, undefined, undefined, undefined, 0)).toBe(
    "Activation price is not supported; the adapter would place a spot order",
  );
});
