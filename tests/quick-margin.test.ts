import { expect, test } from "vitest";
import { quickMarginReason } from "@/lib/orders/quick-margin";

test("omitted, blank, and false pass", () => {
  expect(quickMarginReason(undefined)).toBeNull();
  expect(quickMarginReason(null, null, null)).toBeNull();
  expect(quickMarginReason("", "  ", false)).toBeNull();
  expect(quickMarginReason(false, false, false)).toBeNull();
});

test("a present quick margin type is refused and does not halt", () => {
  expect(quickMarginReason("auto_borrow")).toBe(
    "Quick margin type is not supported; the adapter would place a cash spot order",
  );
  expect(quickMarginReason(1)).toBe(
    "Quick margin type is not supported; the adapter would place a cash spot order",
  );
  expect(quickMarginReason(undefined, "auto_repay")).toBe(
    "Quick margin is not supported; the adapter would place a cash spot order",
  );
  expect(quickMarginReason(undefined, undefined, 0)).toBe(
    "Auto loan is not supported; the adapter would place a cash spot order",
  );
});
