import { expect, test } from "vitest";
import { closePositionReason } from "@/lib/orders/close-position";

test("omitted, blank, and false pass", () => {
  expect(closePositionReason(undefined)).toBeNull();
  expect(closePositionReason(null, null, null)).toBeNull();
  expect(closePositionReason("", "  ", false)).toBeNull();
  expect(closePositionReason(false, false, false)).toBeNull();
});

test("a present close flag is refused and does not halt", () => {
  expect(closePositionReason(true)).toBe(
    "Close position is not supported; the adapter would place a normal spot order",
  );
  expect(closePositionReason(0)).toBe(
    "Close position is not supported; the adapter would place a normal spot order",
  );
  expect(closePositionReason(undefined, true)).toBe(
    "Close on trigger is not supported; the adapter would place a normal spot order",
  );
  expect(closePositionReason(undefined, undefined, "close")).toBe(
    "Close order is not supported; the adapter would place a normal spot order",
  );
});
