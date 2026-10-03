import { expect, test } from "vitest";
import { normalizeOrderType } from "@/lib/orders/order-type";

test("omitted, blank, and mixed case map to market or limit", () => {
  expect(normalizeOrderType(undefined)).toEqual({ type: "market" });
  expect(normalizeOrderType("   ")).toEqual({ type: "market" });
  expect(normalizeOrderType("MARKET")).toEqual({ type: "market" });
  expect(normalizeOrderType("  Limit  ")).toEqual({ type: "limit" });
});

test("an unknown type is refused and does not halt", () => {
  const reason = normalizeOrderType("stop");
  expect(reason).toEqual({ reason: "Unsupported order type: stop" });
  expect("reason" in reason && reason.reason).toMatch(/Unsupported order type/);
});

test("a non-string type is refused", () => {
  expect(normalizeOrderType(1)).toEqual({ reason: "Unsupported order type: 1" });
});
