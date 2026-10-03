import { expect, test } from "vitest";
import { stopPriceReason } from "@/lib/orders/stop-price";

test("omitted and blank stop prices pass", () => {
  expect(stopPriceReason(undefined)).toBeNull();
  expect(stopPriceReason(null)).toBeNull();
  expect(stopPriceReason("")).toBeNull();
  expect(stopPriceReason("  ")).toBeNull();
});

test("a present stop price is refused and does not halt", () => {
  expect(stopPriceReason(100)).toBe(
    "Stop price is not supported; the adapter would place a normal order",
  );
  expect(stopPriceReason(0)).toBe(
    "Stop price is not supported; the adapter would place a normal order",
  );
  expect(stopPriceReason("99.5")).toBe(
    "Stop price is not supported; the adapter would place a normal order",
  );
});
