import { expect, test } from "vitest";
import { spotOnlyReason } from "@/lib/orders/spot-only";

test("omitted, blank, false, and spot trade types pass", () => {
  expect(spotOnlyReason(undefined)).toBeNull();
  expect(spotOnlyReason(null, null, null, null, null)).toBeNull();
  expect(spotOnlyReason("", "  ", "", false, false)).toBeNull();
  expect(spotOnlyReason(undefined, undefined, "TRADE")).toBeNull();
  expect(spotOnlyReason(undefined, undefined, " spot ")).toBeNull();
});

test("a present leverage or margin flag is refused and does not halt", () => {
  expect(spotOnlyReason(5)).toBe(
    "Leverage is not supported; the adapter would place a spot order",
  );
  expect(spotOnlyReason(1)).toBe(
    "Leverage is not supported; the adapter would place a spot order",
  );
  expect(spotOnlyReason(undefined, "isolated")).toBe(
    "Margin mode is not supported; the adapter would place a spot order",
  );
  expect(spotOnlyReason(undefined, undefined, "MARGIN_TRADE")).toBe(
    "Trade type is not supported; the adapter would place a spot order",
  );
  expect(spotOnlyReason(undefined, undefined, "margin")).toBe(
    "Trade type is not supported; the adapter would place a spot order",
  );
  expect(spotOnlyReason(undefined, undefined, "TRADE", true)).toBe(
    "Margin trade is not supported; the adapter would place a spot order",
  );
  expect(spotOnlyReason(undefined, undefined, undefined, 0)).toBe(
    "Margin trade is not supported; the adapter would place a spot order",
  );
  expect(spotOnlyReason(undefined, undefined, undefined, false, "yes")).toBe(
    "Margin flag is not supported; the adapter would place a spot order",
  );
});
