import { expect, test } from "vitest";
import { crossMarginReason } from "@/lib/orders/cross-margin";

test("omitted, blank, and false pass", () => {
  expect(crossMarginReason(undefined)).toBeNull();
  expect(crossMarginReason(null, null, null)).toBeNull();
  expect(crossMarginReason("", "  ", false)).toBeNull();
  expect(crossMarginReason(false, false, false)).toBeNull();
});

test("a present cross-margin alias is refused and does not halt", () => {
  expect(crossMarginReason("cross")).toBe(
    "Margin-mode alias is not supported; the adapter would place a plain spot order",
  );
  expect(crossMarginReason("isolated")).toBe(
    "Margin-mode alias is not supported; the adapter would place a plain spot order",
  );
  expect(crossMarginReason(undefined, "cross")).toBe(
    "Trade-mode alias is not supported; the adapter would place a plain spot order",
  );
  expect(crossMarginReason(undefined, undefined, true)).toBe(
    "Cross margin is not supported; the adapter would place a plain spot order",
  );
  expect(crossMarginReason(undefined, undefined, 0)).toBe(
    "Cross margin is not supported; the adapter would place a plain spot order",
  );
});
