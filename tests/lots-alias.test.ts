import { expect, test } from "vitest";
import { lotsAliasReason } from "@/lib/orders/lots-alias";

test("omitted, null, and blank lots aliases pass", () => {
  expect(lotsAliasReason(undefined)).toBeNull();
  expect(lotsAliasReason(null, null, null)).toBeNull();
  expect(lotsAliasReason("", "  ", "\t")).toBeNull();
});

test("present lots aliases are refused and do not halt", () => {
  expect(lotsAliasReason(1.5)).toBe(
    "Lots alias is not supported; the adapter reads amount",
  );
  expect(lotsAliasReason(undefined, 2)).toBe(
    "Order lots alias is not supported; the adapter reads amount",
  );
  expect(lotsAliasReason(undefined, undefined, "0.5")).toBe(
    "Base lots alias is not supported; the adapter reads amount",
  );
  expect(lotsAliasReason(0)).toBe(
    "Lots alias is not supported; the adapter reads amount",
  );
});
