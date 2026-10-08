import { expect, test } from "vitest";
import { positionIndexReason } from "@/lib/orders/position-index";

test("omitted, blank, and false pass", () => {
  expect(positionIndexReason(undefined)).toBeNull();
  expect(positionIndexReason(null, null, null)).toBeNull();
  expect(positionIndexReason("", "  ", false)).toBeNull();
  expect(positionIndexReason(false, false, false)).toBeNull();
});

test("a present hedge index is refused and does not halt", () => {
  expect(positionIndexReason(1)).toBe(
    "Position index is not supported; the adapter would place a spot order",
  );
  expect(positionIndexReason(0)).toBe(
    "Position index is not supported; the adapter would place a spot order",
  );
  expect(positionIndexReason(undefined, "long")).toBe(
    "Position side alias is not supported; the adapter would place a spot order",
  );
  expect(positionIndexReason(undefined, undefined, 2)).toBe(
    "Position index alias is not supported; the adapter would place a spot order",
  );
});
