import { expect, test } from "vitest";
import { stopPriceReason } from "@/lib/orders/stop-price";

test("omitted, blank, and false pass", () => {
  expect(stopPriceReason(undefined)).toBeNull();
  expect(stopPriceReason(null, null, null)).toBeNull();
  expect(stopPriceReason("", "  ", false)).toBeNull();
  expect(stopPriceReason(false, false, false)).toBeNull();
});

test("a present stop-price field is refused and does not halt", () => {
  expect(stopPriceReason(100.5)).toBe(
    "Stop price is not supported; the adapter would place a plain spot order",
  );
  expect(stopPriceReason(0)).toBe(
    "Stop price is not supported; the adapter would place a plain spot order",
  );
  expect(stopPriceReason(undefined, 99.0)).toBe(
    "Trigger price is not supported; the adapter would place a plain spot order",
  );
  expect(stopPriceReason(undefined, undefined, "50")).toBe(
    "Stop px is not supported; the adapter would place a plain spot order",
  );
});
