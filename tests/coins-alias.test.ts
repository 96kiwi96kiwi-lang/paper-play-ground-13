import { expect, test } from "vitest";
import { coinsAliasReason } from "@/lib/orders/coins-alias";

test("omitted, null, and blank coins aliases pass", () => {
  expect(coinsAliasReason(undefined)).toBeNull();
  expect(coinsAliasReason(null, null, null)).toBeNull();
  expect(coinsAliasReason("", "  ", "")).toBeNull();
});

test("present coins aliases are refused and do not halt", () => {
  expect(coinsAliasReason(1.5)).toBe(
    "Coins alias is not supported; the adapter reads amount",
  );
  expect(coinsAliasReason(undefined, "0.1")).toBe(
    "Order coins alias is not supported; the adapter reads amount",
  );
  expect(coinsAliasReason(undefined, undefined, 100)).toBe(
    "Base coins alias is not supported; the adapter reads amount",
  );
  expect(coinsAliasReason(0)).toBe(
    "Coins alias is not supported; the adapter reads amount",
  );
});
