import { expect, test } from "vitest";
import { productAliasReason } from "@/lib/orders/product-alias";

test("omitted, null, and blank product aliases pass", () => {
  expect(productAliasReason(undefined)).toBeNull();
  expect(productAliasReason(null, null, null)).toBeNull();
  expect(productAliasReason("", "  ", "")).toBeNull();
});

test("present product aliases are refused and do not halt", () => {
  expect(productAliasReason("BTC-USDT")).toBe(
    "Product alias is not supported; the adapter reads symbol",
  );
  expect(productAliasReason(undefined, "BTC-USDT")).toBe(
    "Inst id alias is not supported; the adapter reads symbol",
  );
  expect(productAliasReason(undefined, undefined, "BTCUSDT")).toBe(
    "Ticker alias is not supported; the adapter reads symbol",
  );
  expect(productAliasReason(0)).toBe(
    "Product alias is not supported; the adapter reads symbol",
  );
});
