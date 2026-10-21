import { expect, test } from "vitest";
import { gridReason } from "@/lib/orders/grid";

test("omitted, blank, and false pass", () => {
  expect(gridReason(undefined)).toBeNull();
  expect(gridReason(null, null, null)).toBeNull();
  expect(gridReason("", "  ", false)).toBeNull();
  expect(gridReason(false, false, false)).toBeNull();
});

test("a present grid or algo id is refused and does not halt", () => {
  expect(gridReason(true)).toBe(
    "Grid is not supported; the adapter would place a plain spot order",
  );
  expect(gridReason("grid-1")).toBe(
    "Grid is not supported; the adapter would place a plain spot order",
  );
  expect(gridReason(undefined, "gid")).toBe(
    "Grid id is not supported; the adapter would place a plain spot order",
  );
  expect(gridReason(undefined, undefined, "algo")).toBe(
    "Algo id is not supported; the adapter would place a plain spot order",
  );
  expect(gridReason(undefined, undefined, 0)).toBe(
    "Algo id is not supported; the adapter would place a plain spot order",
  );
});
