import { expect, test } from "vitest";
import { positionSideReason } from "@/lib/orders/position-side";

test("omitted, blank, and false pass", () => {
  expect(positionSideReason(undefined)).toBeNull();
  expect(positionSideReason(null, null, null)).toBeNull();
  expect(positionSideReason("", "  ", false)).toBeNull();
  expect(positionSideReason(false, false, false)).toBeNull();
});

test("a present position side, hedge mode, or position mode is refused and does not halt", () => {
  expect(positionSideReason("LONG")).toBe(
    "Position side is not supported; the adapter would place a spot order",
  );
  expect(positionSideReason("SHORT")).toBe(
    "Position side is not supported; the adapter would place a spot order",
  );
  expect(positionSideReason(undefined, "hedge")).toBe(
    "Hedge mode is not supported; the adapter would place a spot order",
  );
  expect(positionSideReason(undefined, undefined, "BOTH")).toBe(
    "Position mode is not supported; the adapter would place a spot order",
  );
  expect(positionSideReason(undefined, undefined, 0)).toBe(
    "Position mode is not supported; the adapter would place a spot order",
  );
});
