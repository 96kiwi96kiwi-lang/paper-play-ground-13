import { expect, test } from "vitest";
import { autoBorrowReason } from "@/lib/orders/auto-borrow";

test("omitted, blank, and false borrow flags pass", () => {
  expect(autoBorrowReason(undefined)).toBeNull();
  expect(autoBorrowReason(null, null)).toBeNull();
  expect(autoBorrowReason("", "  ")).toBeNull();
  expect(autoBorrowReason(false, false)).toBeNull();
});

test("true borrow flags are refused and do not halt", () => {
  expect(autoBorrowReason(true)).toBe(
    "Auto-borrow is not supported; the adapter would place a spot order",
  );
  expect(autoBorrowReason(false, true)).toBe(
    "Auto-repay is not supported; the adapter would place a spot order",
  );
  expect(autoBorrowReason("yes")).toBe("Auto-borrow must be a boolean");
  expect(autoBorrowReason(false, 1)).toBe("Auto-repay must be a boolean");
});
