import { expect, test } from "vitest";
import { pairAliasReason } from "@/lib/orders/pair-alias";

test("omitted, null, and blank pair aliases pass", () => {
  expect(pairAliasReason(undefined)).toBeNull();
  expect(pairAliasReason(null, null, null)).toBeNull();
  expect(pairAliasReason("", "  ", "")).toBeNull();
});

test("present pair aliases are refused and do not halt", () => {
  expect(pairAliasReason("BTC-USDT")).toBe(
    "Pair alias is not supported; the adapter reads symbol",
  );
  expect(pairAliasReason(undefined, "ETH-USDT")).toBe(
    "Market alias is not supported; the adapter reads symbol",
  );
  expect(pairAliasReason(undefined, undefined, "BTCUSDT")).toBe(
    "Instrument alias is not supported; the adapter reads symbol",
  );
  expect(pairAliasReason(0)).toBe(
    "Pair alias is not supported; the adapter reads symbol",
  );
});
