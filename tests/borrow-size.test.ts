import { expect, test } from "vitest";
import { borrowSizeReason } from "@/lib/orders/borrow-size";

test("omitted, blank, and false pass", () => {
  expect(borrowSizeReason(undefined)).toBeNull();
  expect(borrowSizeReason(null, null, null)).toBeNull();
  expect(borrowSizeReason("", "  ", false)).toBeNull();
  expect(borrowSizeReason(false, false, false)).toBeNull();
});

test("a present borrow size is refused and does not halt", () => {
  expect(borrowSizeReason(0.5)).toBe(
    "Borrow amount is not supported; the adapter places the base size on the spot book",
  );
  expect(borrowSizeReason(0)).toBe(
    "Borrow amount is not supported; the adapter places the base size on the spot book",
  );
  expect(borrowSizeReason(undefined, "0.25")).toBe(
    "Borrow size is not supported; the adapter places the base size on the spot book",
  );
  expect(borrowSizeReason(undefined, undefined, 10)).toBe(
    "Loan amount is not supported; the adapter places the base size on the spot book",
  );
  expect(borrowSizeReason(undefined, undefined, true)).toBe(
    "Loan amount is not supported; the adapter places the base size on the spot book",
  );
});
