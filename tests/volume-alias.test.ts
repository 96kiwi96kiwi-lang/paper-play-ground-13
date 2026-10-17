import { expect, test } from "vitest";
import { volumeAliasReason } from "@/lib/orders/volume-alias";

test("omitted, null, and blank volume aliases pass", () => {
  expect(volumeAliasReason(undefined)).toBeNull();
  expect(volumeAliasReason(null, null, null)).toBeNull();
  expect(volumeAliasReason("", "  ", "\t")).toBeNull();
});

test("present volume aliases are refused and do not halt", () => {
  expect(volumeAliasReason(1.5)).toBe(
    "Volume alias is not supported; the adapter reads amount",
  );
  expect(volumeAliasReason(undefined, 2)).toBe(
    "Order volume alias is not supported; the adapter reads amount",
  );
  expect(volumeAliasReason(undefined, undefined, "0.5")).toBe(
    "Base volume alias is not supported; the adapter reads amount",
  );
  expect(volumeAliasReason(0)).toBe(
    "Volume alias is not supported; the adapter reads amount",
  );
});
