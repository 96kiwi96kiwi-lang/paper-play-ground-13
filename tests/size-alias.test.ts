import { expect, test } from "vitest";
import { sizeAliasReason } from "@/lib/orders/size-alias";

test("omitted, null, and blank size aliases pass", () => {
  expect(sizeAliasReason(undefined)).toBeNull();
  expect(sizeAliasReason(null, null, null)).toBeNull();
  expect(sizeAliasReason("", "  ", "")).toBeNull();
});

test("present size aliases are refused and do not halt", () => {
  expect(sizeAliasReason(1.5)).toBe(
    "Qty alias is not supported; the adapter reads amount",
  );
  expect(sizeAliasReason(undefined, "0.1")).toBe(
    "Size alias is not supported; the adapter reads amount",
  );
  expect(sizeAliasReason(undefined, undefined, 100)).toBe(
    "Quantity alias is not supported; the adapter reads amount",
  );
  expect(sizeAliasReason(0)).toBe(
    "Qty alias is not supported; the adapter reads amount",
  );
});
