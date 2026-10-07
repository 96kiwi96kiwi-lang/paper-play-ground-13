import { expect, test } from "vitest";
import { repaySizeReason } from "@/lib/orders/repay-size";

test("omitted, blank, and false pass", () => {
  expect(repaySizeReason(undefined)).toBeNull();
  expect(repaySizeReason(null, null, null)).toBeNull();
  expect(repaySizeReason("", "  ", false)).toBeNull();
  expect(repaySizeReason(false, false, false)).toBeNull();
});

test("a present repay size is refused and does not halt", () => {
  expect(repaySizeReason(0.5)).toBe(
    "Repay amount is not supported; the adapter places the base size on the spot book",
  );
  expect(repaySizeReason(0)).toBe(
    "Repay amount is not supported; the adapter places the base size on the spot book",
  );
  expect(repaySizeReason(undefined, "0.25")).toBe(
    "Repay size is not supported; the adapter places the base size on the spot book",
  );
  expect(repaySizeReason(undefined, undefined, 10)).toBe(
    "Debt amount is not supported; the adapter places the base size on the spot book",
  );
  expect(repaySizeReason(undefined, undefined, true)).toBe(
    "Debt amount is not supported; the adapter places the base size on the spot book",
  );
});
