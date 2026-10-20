import { expect, test } from "vitest";
import { currencyAliasReason } from "@/lib/orders/currency-alias";

test("omitted, null, and blank currency aliases pass", () => {
  expect(currencyAliasReason(undefined)).toBeNull();
  expect(currencyAliasReason(null, null, null)).toBeNull();
  expect(currencyAliasReason("", "  ", "")).toBeNull();
});

test("present currency aliases are refused and do not halt", () => {
  expect(currencyAliasReason(1.5)).toBe(
    "Currency alias is not supported; the adapter reads amount",
  );
  expect(currencyAliasReason(undefined, "0.1")).toBe(
    "Order currency alias is not supported; the adapter reads amount",
  );
  expect(currencyAliasReason(undefined, undefined, 100)).toBe(
    "Base currency alias is not supported; the adapter reads amount",
  );
  expect(currencyAliasReason(0)).toBe(
    "Currency alias is not supported; the adapter reads amount",
  );
});
