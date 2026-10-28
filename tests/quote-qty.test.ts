import { expect, test } from "vitest";
import { quoteQtyReason } from "@/lib/orders/quote-qty";

test("omitted, blank, and false pass", () => {
  expect(quoteQtyReason(undefined)).toBeNull();
  expect(quoteQtyReason(null, null, null)).toBeNull();
  expect(quoteQtyReason("", "  ", false)).toBeNull();
  expect(quoteQtyReason(false, false, false)).toBeNull();
});

test("a present quote-quantity field is refused and does not halt", () => {
  expect(quoteQtyReason(true)).toBe(
    "Quote quantity is not supported; the adapter would place a base-amount order",
  );
  expect(quoteQtyReason(0)).toBe(
    "Quote quantity is not supported; the adapter would place a base-amount order",
  );
  expect(quoteQtyReason(undefined, 100)).toBe(
    "Quote order quantity is not supported; the adapter would place a base-amount order",
  );
  expect(quoteQtyReason(undefined, undefined, 50.5)).toBe(
    "Notional is not supported; the adapter would place a base-amount order",
  );
});
