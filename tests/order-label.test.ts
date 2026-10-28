import { expect, test } from "vitest";
import { orderLabelReason } from "@/lib/orders/order-label";

test("omitted, null, false, and blank order-label fields pass", () => {
  expect(orderLabelReason()).toBeNull();
  expect(orderLabelReason(null, null, null)).toBeNull();
  expect(orderLabelReason(false, "", "  ")).toBeNull();
});

test("a present order label field is refused and does not halt", () => {
  expect(orderLabelReason("grid-a")).toBe(
    "Order label is not supported; the adapter would place a plain spot order",
  );
  expect(orderLabelReason(0)).toBe(
    "Order label is not supported; the adapter would place a plain spot order",
  );
  expect(orderLabelReason(undefined, "bot")).toBe(
    "Order label alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderLabelReason(undefined, undefined, "desk")).toBe(
    "Client label alias is not supported; the adapter would place a plain spot order",
  );
});
