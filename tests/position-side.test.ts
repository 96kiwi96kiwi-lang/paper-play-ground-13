import { expect, test } from "vitest";
import { positionSideReason } from "@/lib/orders/position-side";

test("omitted, null, and blank position-side fields pass", () => {
  expect(positionSideReason(undefined)).toBeNull();
  expect(positionSideReason(null, null, null)).toBeNull();
  expect(positionSideReason("", "  ", "")).toBeNull();
  expect(positionSideReason(undefined, false)).toBeNull();
});

test("present position side or hedge flags are refused and do not halt", () => {
  expect(positionSideReason("LONG")).toBe(
    "Position side is not supported; the adapter would place a spot order",
  );
  expect(positionSideReason(" short ")).toBe(
    "Position side is not supported; the adapter would place a spot order",
  );
  expect(positionSideReason("BOTH")).toBe(
    "Position side is not supported; the adapter would place a spot order",
  );
  expect(positionSideReason(undefined, "hedge")).toBe(
    "Hedge mode is not supported; the adapter would place a spot order",
  );
  expect(positionSideReason(undefined, true)).toBe(
    "Hedge mode is not supported; the adapter would place a spot order",
  );
  expect(positionSideReason(undefined, undefined, "hedge")).toBe(
    "Position mode is not supported; the adapter would place a spot order",
  );
});
