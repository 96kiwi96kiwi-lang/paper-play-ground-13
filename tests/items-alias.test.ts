import { expect, test } from "vitest";
import { itemsAliasReason } from "@/lib/orders/items-alias";

test("omitted, null, and blank items aliases pass", () => {
  expect(itemsAliasReason(undefined)).toBeNull();
  expect(itemsAliasReason(null, null, null)).toBeNull();
  expect(itemsAliasReason("", "  ", "")).toBeNull();
});

test("present items aliases are refused and do not halt", () => {
  expect(itemsAliasReason(1.5)).toBe(
    "Items alias is not supported; the adapter reads amount",
  );
  expect(itemsAliasReason(undefined, "0.1")).toBe(
    "Order items alias is not supported; the adapter reads amount",
  );
  expect(itemsAliasReason(undefined, undefined, 100)).toBe(
    "Base items alias is not supported; the adapter reads amount",
  );
  expect(itemsAliasReason(0)).toBe(
    "Items alias is not supported; the adapter reads amount",
  );
});
