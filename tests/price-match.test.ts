import { expect, test } from "vitest";
import { priceMatchReason } from "@/lib/orders/price-match";

test("omitted, null, false, and blank price-match fields pass", () => {
  expect(priceMatchReason(undefined)).toBeNull();
  expect(priceMatchReason(null, null, null)).toBeNull();
  expect(priceMatchReason(false, "", "  ")).toBeNull();
});

test("present price-match fields are refused and do not halt", () => {
  expect(priceMatchReason("OPPONENT")).toBe(
    "Price match is not supported; the adapter would place without a book-relative price",
  );
  expect(priceMatchReason(undefined, "PRIMARY")).toBe(
    "Peg price type is not supported; the adapter would place without a book-relative price",
  );
  expect(priceMatchReason(undefined, undefined, 0)).toBe(
    "Peg offset is not supported; the adapter would place without a book-relative price",
  );
});
