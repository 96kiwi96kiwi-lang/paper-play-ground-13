import { expect, test } from "vitest";
import { reduceOnlyReason } from "@/lib/orders/reduce-only";

test("omitted and false pass", () => {
  expect(reduceOnlyReason(undefined)).toBeNull();
  expect(reduceOnlyReason(null)).toBeNull();
  expect(reduceOnlyReason(false)).toBeNull();
});

test("true is refused and does not halt", () => {
  expect(reduceOnlyReason(true)).toBe(
    "Reduce-only is not supported; the adapter would place a normal order",
  );
});

test("a non-boolean reduce-only flag is refused", () => {
  expect(reduceOnlyReason("true")).toBe("Reduce-only must be omitted or false");
  expect(reduceOnlyReason(1)).toBe("Reduce-only must be omitted or false");
});
