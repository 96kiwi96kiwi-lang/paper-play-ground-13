import { expect, test } from "vitest";
import { symbolAliasReason } from "@/lib/orders/symbol-alias";

test("omitted, null, and blank symbol aliases pass", () => {
  expect(symbolAliasReason(undefined)).toBeNull();
  expect(symbolAliasReason(null, null, null)).toBeNull();
  expect(symbolAliasReason("", "  ", "\t")).toBeNull();
});

test("present symbol aliases are refused and do not halt", () => {
  expect(symbolAliasReason("ETH/USDT")).toBe(
    "Pair alias is not supported; the adapter reads symbol",
  );
  expect(symbolAliasReason(undefined, "ETH-USDT")).toBe(
    "Market alias is not supported; the adapter reads symbol",
  );
  expect(symbolAliasReason(undefined, undefined, "ETHUSDT")).toBe(
    "Instrument is not supported; the adapter reads symbol",
  );
  expect(symbolAliasReason(0)).toBe(
    "Pair alias is not supported; the adapter reads symbol",
  );
});
