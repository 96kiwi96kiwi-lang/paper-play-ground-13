import { expect, test } from "vitest";
import { priceAliasReason } from "@/lib/orders/price-alias";

test("omitted, null, and blank price aliases pass", () => {
  expect(priceAliasReason(undefined)).toBeNull();
  expect(priceAliasReason(null, null, null)).toBeNull();
  expect(priceAliasReason("", "  ", "")).toBeNull();
});

test("present price aliases are refused and do not halt", () => {
  expect(priceAliasReason("50000")).toBe(
    "Price alias is not supported; the adapter reads price",
  );
  expect(priceAliasReason(undefined, "49999")).toBe(
    "Limit price alias is not supported; the adapter reads price",
  );
  expect(priceAliasReason(undefined, undefined, "50100")).toBe(
    "Order price alias is not supported; the adapter reads price",
  );
  expect(priceAliasReason(0)).toBe(
    "Price alias is not supported; the adapter reads price",
  );
  expect(priceAliasReason(undefined, undefined, undefined, "49800")).toBe(
    "Limit price alias is not supported; the adapter reads price",
  );
});
