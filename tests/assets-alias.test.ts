import { expect, test } from "vitest";
import { assetsAliasReason } from "@/lib/orders/assets-alias";

test("omitted, null, and blank assets aliases pass", () => {
  expect(assetsAliasReason(undefined)).toBeNull();
  expect(assetsAliasReason(null, null, null)).toBeNull();
  expect(assetsAliasReason("", "  ", "")).toBeNull();
});

test("present assets aliases are refused and do not halt", () => {
  expect(assetsAliasReason(1.5)).toBe(
    "Assets alias is not supported; the adapter reads amount",
  );
  expect(assetsAliasReason(undefined, "0.1")).toBe(
    "Order assets alias is not supported; the adapter reads amount",
  );
  expect(assetsAliasReason(undefined, undefined, 100)).toBe(
    "Base assets alias is not supported; the adapter reads amount",
  );
  expect(assetsAliasReason(0)).toBe(
    "Assets alias is not supported; the adapter reads amount",
  );
});
