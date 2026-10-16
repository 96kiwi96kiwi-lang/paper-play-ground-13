import { expect, test } from "vitest";
import { orderTagReason } from "@/lib/orders/order-tag";

test("omitted, null, false, and blank order-tag fields pass", () => {
  expect(orderTagReason(undefined)).toBeNull();
  expect(orderTagReason(null, null, null)).toBeNull();
  expect(orderTagReason(false, "", "  ")).toBeNull();
});

test("a present order tag field is refused and does not halt", () => {
  expect(orderTagReason(true)).toBe(
    "Order tag is not supported; the adapter would place a plain spot order",
  );
  expect(orderTagReason(0)).toBe(
    "Order tag is not supported; the adapter would place a plain spot order",
  );
  expect(orderTagReason(undefined, "grid")).toBe(
    "Order tag alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderTagReason(undefined, undefined, "client")).toBe(
    "Client tag is not supported; the adapter would place a plain spot order",
  );
});
