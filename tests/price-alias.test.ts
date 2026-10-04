import { expect, test } from "vitest";
import { priceAliasReason } from "@/lib/orders/price-alias";

test("omitted, null, and blank price aliases pass", () => {
  expect(priceAliasReason(undefined)).toBeNull();
  expect(priceAliasReason(null, null, null)).toBeNull();
  expect(priceAliasReason("", "  ", "\t")).toBeNull();
});

test("present price aliases are refused and do not halt", () => {
  expect(priceAliasReason(100)).toBe(
    "Limit price alias is not supported; the adapter prices by price",
  );
  expect(priceAliasReason(0)).toBe(
    "Limit price alias is not supported; the adapter prices by price",
  );
  expect(priceAliasReason(undefined, "99.5")).toBe(
    "Order price is not supported; the adapter prices by price",
  );
  expect(priceAliasReason(undefined, undefined, 101)).toBe(
    "Px is not supported; the adapter prices by price",
  );
});
