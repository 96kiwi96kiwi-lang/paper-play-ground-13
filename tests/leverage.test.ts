import { expect, test } from "vitest";
import { leverageReason } from "@/lib/orders/leverage";

test("omitted, blank, and false pass", () => {
  expect(leverageReason(undefined)).toBeNull();
  expect(leverageReason(null, null, null)).toBeNull();
  expect(leverageReason("", "  ", false)).toBeNull();
  expect(leverageReason(false, false, false)).toBeNull();
});

test("a present leverage, isolated, or margin mode is refused and does not halt", () => {
  expect(leverageReason(5)).toBe(
    "Leverage is not supported; the adapter would place a spot order",
  );
  expect(leverageReason(0)).toBe(
    "Leverage is not supported; the adapter would place a spot order",
  );
  expect(leverageReason(undefined, true)).toBe(
    "Isolated margin is not supported; the adapter would place a spot order",
  );
  expect(leverageReason(undefined, undefined, "isolated")).toBe(
    "Margin mode is not supported; the adapter would place a spot order",
  );
  expect(leverageReason(undefined, undefined, "cross")).toBe(
    "Margin mode is not supported; the adapter would place a spot order",
  );
});
