import { expect, test } from "vitest";
import { positionsAliasReason } from "@/lib/orders/positions-alias";

test("omitted, null, and blank positions aliases pass", () => {
  expect(positionsAliasReason(undefined)).toBeNull();
  expect(positionsAliasReason(null, null, null)).toBeNull();
  expect(positionsAliasReason("", "  ", "")).toBeNull();
});

test("present positions aliases are refused and do not halt", () => {
  expect(positionsAliasReason(1.5)).toBe(
    "Positions alias is not supported; the adapter reads amount",
  );
  expect(positionsAliasReason(undefined, "0.1")).toBe(
    "Order positions alias is not supported; the adapter reads amount",
  );
  expect(positionsAliasReason(undefined, undefined, 100)).toBe(
    "Base positions alias is not supported; the adapter reads amount",
  );
  expect(positionsAliasReason(0)).toBe(
    "Positions alias is not supported; the adapter reads amount",
  );
});
