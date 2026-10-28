import { expect, test } from "vitest";
import { assetAliasReason } from "@/lib/orders/asset-alias";

test("omitted, null, and blank asset aliases pass", () => {
  expect(assetAliasReason(undefined)).toBeNull();
  expect(assetAliasReason(null, null, null)).toBeNull();
  expect(assetAliasReason("", "  ", "")).toBeNull();
});

test("present asset aliases are refused and do not halt", () => {
  expect(assetAliasReason(1.5)).toBe(
    "Asset alias is not supported; the adapter reads amount",
  );
  expect(assetAliasReason(undefined, "0.1")).toBe(
    "Order asset alias is not supported; the adapter reads amount",
  );
  expect(assetAliasReason(undefined, undefined, 100)).toBe(
    "Base asset alias is not supported; the adapter reads amount",
  );
  expect(assetAliasReason(0)).toBe(
    "Asset alias is not supported; the adapter reads amount",
  );
});
