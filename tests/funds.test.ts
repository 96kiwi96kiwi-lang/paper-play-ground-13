import { expect, test } from "vitest";
import { fundsReason } from "@/lib/orders/funds";

test("omitted, blank, and false pass", () => {
  expect(fundsReason(undefined)).toBeNull();
  expect(fundsReason(null)).toBeNull();
  expect(fundsReason("")).toBeNull();
  expect(fundsReason("  ")).toBeNull();
  expect(fundsReason(false)).toBeNull();
  expect(fundsReason(undefined, null, false)).toBeNull();
});

test("a present funds is refused and does not halt", () => {
  expect(fundsReason(true)).toBe(
    "Funds is not supported; the adapter would place a base-amount order",
  );
  expect(fundsReason(0)).toBe(
    "Funds is not supported; the adapter would place a base-amount order",
  );
  expect(fundsReason("0")).toBe(
    "Funds is not supported; the adapter would place a base-amount order",
  );
  expect(fundsReason(100.5)).toBe(
    "Funds is not supported; the adapter would place a base-amount order",
  );
  expect(fundsReason(undefined, 50)).toBe(
    "Quote funds is not supported; the adapter would place a base-amount order",
  );
  expect(fundsReason(undefined, undefined, "25")).toBe(
    "Funds amount is not supported; the adapter would place a base-amount order",
  );
});
