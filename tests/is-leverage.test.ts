import { expect, test } from "vitest";
import { isLeverageReason } from "@/lib/orders/is-leverage";

test("omitted, blank, and false pass", () => {
  expect(isLeverageReason(undefined)).toBeNull();
  expect(isLeverageReason(null, null, null)).toBeNull();
  expect(isLeverageReason("", "  ", false)).toBeNull();
  expect(isLeverageReason(false, false, false)).toBeNull();
});

test("a present is-leverage flag is refused and does not halt", () => {
  expect(isLeverageReason("TRUE")).toBe(
    "Is-leverage is not supported; the adapter would place a spot order",
  );
  expect(isLeverageReason(1)).toBe(
    "Is-leverage is not supported; the adapter would place a spot order",
  );
  expect(isLeverageReason(undefined, "on")).toBe(
    "Leverage flag is not supported; the adapter would place a spot order",
  );
  expect(isLeverageReason(undefined, undefined, 0)).toBe(
    "Margin leverage is not supported; the adapter would place a spot order",
  );
});
