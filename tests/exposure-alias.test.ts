import { expect, test } from "vitest";
import { exposureAliasReason } from "@/lib/orders/exposure-alias";

test("omitted, null, and blank exposure aliases pass", () => {
  expect(exposureAliasReason(undefined)).toBeNull();
  expect(exposureAliasReason(null, null, null)).toBeNull();
  expect(exposureAliasReason("", "  ", "\t")).toBeNull();
});

test("present exposure aliases are refused and do not halt", () => {
  expect(exposureAliasReason(1.5)).toBe(
    "Exposure alias is not supported; the adapter reads amount",
  );
  expect(exposureAliasReason(undefined, 2)).toBe(
    "Order exposure alias is not supported; the adapter reads amount",
  );
  expect(exposureAliasReason(undefined, undefined, "0.5")).toBe(
    "Base exposure alias is not supported; the adapter reads amount",
  );
  expect(exposureAliasReason(0)).toBe(
    "Exposure alias is not supported; the adapter reads amount",
  );
});
