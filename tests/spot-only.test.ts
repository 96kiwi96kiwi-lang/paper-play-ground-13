import { expect, test } from "vitest";
import { spotOnlyReason } from "@/lib/orders/spot-only";

test("omitted and blank leverage or margin flags pass", () => {
  expect(spotOnlyReason(undefined)).toBeNull();
  expect(spotOnlyReason(null, null, null)).toBeNull();
  expect(spotOnlyReason("", "  ", "")).toBeNull();
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
});
