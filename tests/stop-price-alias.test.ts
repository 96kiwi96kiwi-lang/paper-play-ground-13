import { expect, test } from "vitest";
import { stopPriceAliasReason } from "@/lib/orders/stop-price-alias";

test("omitted, null, and blank stop-price aliases pass", () => {
  expect(stopPriceAliasReason(undefined)).toBeNull();
  expect(stopPriceAliasReason(null, null, null)).toBeNull();
  expect(stopPriceAliasReason("", "  ", "\t")).toBeNull();
});

test("present stop-price aliases are refused and do not halt", () => {
  expect(stopPriceAliasReason(100)).toBe(
    "Stop price alias is not supported; the adapter places market or limit",
  );
  expect(stopPriceAliasReason(undefined, 99.5)).toBe(
    "Trigger price alias is not supported; the adapter places market or limit",
  );
  expect(stopPriceAliasReason(undefined, undefined, "98")).toBe(
    "Stop px alias is not supported; the adapter places market or limit",
  );
  expect(stopPriceAliasReason(0)).toBe(
    "Stop price alias is not supported; the adapter places market or limit",
  );
});
