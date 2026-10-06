import { expect, test } from "vitest";
import { gridIdReason } from "@/lib/orders/grid-id";

test("omitted, null, false, and blank grid ids pass", () => {
  expect(gridIdReason(undefined)).toBeNull();
  expect(gridIdReason(null, null, null)).toBeNull();
  expect(gridIdReason(false, "", "  ")).toBeNull();
});

test("a present grid id is refused and does not halt", () => {
  expect(gridIdReason(true)).toBe(
    "Grid is not supported; the adapter would place a plain spot order",
  );
  expect(gridIdReason(0)).toBe(
    "Grid is not supported; the adapter would place a plain spot order",
  );
  expect(gridIdReason(undefined, "grid-1")).toBe(
    "Grid id is not supported; the adapter would place a plain spot order",
  );
  expect(gridIdReason(undefined, undefined, "algo-9")).toBe(
    "Algo id is not supported; the adapter would place a plain spot order",
  );
});
