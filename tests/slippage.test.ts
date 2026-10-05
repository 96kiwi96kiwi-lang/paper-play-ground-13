import { expect, test } from "vitest";
import { slippageReason } from "@/lib/orders/slippage";

test("omitted, null, false, and blank slippage fields pass", () => {
  expect(slippageReason(undefined)).toBeNull();
  expect(slippageReason(null, null, null)).toBeNull();
  expect(slippageReason(false, "", "  ")).toBeNull();
});

test("present slippage fields are refused and do not halt", () => {
  expect(slippageReason(0.01)).toBe(
    "Max slippage is not supported; the adapter would place without a book-move cap",
  );
  expect(slippageReason(undefined, "0.5%")).toBe(
    "Slippage is not supported; the adapter would place without a book-move cap",
  );
  expect(slippageReason(undefined, undefined, 0)).toBe(
    "Slippage tolerance is not supported; the adapter would place without a book-move cap",
  );
});
