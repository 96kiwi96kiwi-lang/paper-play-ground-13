import { expect, test } from "vitest";
import { orderSourceReason } from "@/lib/orders/order-source";

test("omitted, null, false, and blank order-source fields pass", () => {
  expect(orderSourceReason()).toBeNull();
  expect(orderSourceReason(null, null, null)).toBeNull();
  expect(orderSourceReason(false, "", "  ")).toBeNull();
});

test("a present order source field is refused and does not halt", () => {
  expect(orderSourceReason("grid-a")).toBe(
    "Order source is not supported; the adapter would place a plain spot order",
  );
  expect(orderSourceReason(0)).toBe(
    "Order source is not supported; the adapter would place a plain spot order",
  );
  expect(orderSourceReason(undefined, "bot")).toBe(
    "Order source alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderSourceReason(undefined, undefined, "desk")).toBe(
    "Client source alias is not supported; the adapter would place a plain spot order",
  );
});
