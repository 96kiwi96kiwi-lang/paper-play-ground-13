import { expect, test } from "vitest";
import { openOffsetReason } from "@/lib/orders/open-offset";

test("omitted, blank, and false pass", () => {
  expect(openOffsetReason(undefined)).toBeNull();
  expect(openOffsetReason(null, null, null)).toBeNull();
  expect(openOffsetReason("", "  ", false)).toBeNull();
  expect(openOffsetReason(false, false, false)).toBeNull();
});

test("a present open or close offset is refused and does not halt", () => {
  expect(openOffsetReason("close")).toBe(
    "Open/close offset is not supported; the adapter would place a spot order",
  );
  expect(openOffsetReason("open")).toBe(
    "Open/close offset is not supported; the adapter would place a spot order",
  );
  expect(openOffsetReason(undefined, "close")).toBe(
    "Position offset is not supported; the adapter would place a spot order",
  );
  expect(openOffsetReason(undefined, undefined, 1)).toBe(
    "Close fraction is not supported; the adapter would place a spot order",
  );
  expect(openOffsetReason(undefined, undefined, 0)).toBe(
    "Close fraction is not supported; the adapter would place a spot order",
  );
});
