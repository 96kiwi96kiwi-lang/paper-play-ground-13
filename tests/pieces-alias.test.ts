import { expect, test } from "vitest";
import { piecesAliasReason } from "@/lib/orders/pieces-alias";

test("omitted, null, and blank pieces aliases pass", () => {
  expect(piecesAliasReason(undefined)).toBeNull();
  expect(piecesAliasReason(null, null, null)).toBeNull();
  expect(piecesAliasReason("", "  ", "")).toBeNull();
});

test("present pieces aliases are refused and do not halt", () => {
  expect(piecesAliasReason(1.5)).toBe(
    "Pieces alias is not supported; the adapter reads amount",
  );
  expect(piecesAliasReason(undefined, "0.1")).toBe(
    "Order pieces alias is not supported; the adapter reads amount",
  );
  expect(piecesAliasReason(undefined, undefined, 100)).toBe(
    "Base pieces alias is not supported; the adapter reads amount",
  );
  expect(piecesAliasReason(0)).toBe(
    "Pieces alias is not supported; the adapter reads amount",
  );
});
