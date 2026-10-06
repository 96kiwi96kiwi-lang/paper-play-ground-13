import { expect, test } from "vitest";
import { strategyIdReason } from "@/lib/orders/strategy-id";

test("omitted, null, false, and blank strategy fields pass", () => {
  expect(strategyIdReason(undefined)).toBeNull();
  expect(strategyIdReason(null, null, null)).toBeNull();
  expect(strategyIdReason(false, "", "  ")).toBeNull();
});

test("present strategy fields are refused and do not halt", () => {
  expect(strategyIdReason(1000001)).toBe(
    "Strategy id is not supported; the adapter would place a plain spot order",
  );
  expect(strategyIdReason(undefined, 0)).toBe(
    "Strategy type is not supported; the adapter would place a plain spot order",
  );
  expect(strategyIdReason(undefined, undefined, "MARK_PRICE")).toBe(
    "Working type is not supported; the adapter would place a plain spot order",
  );
});
