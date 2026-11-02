import { expect, test } from "vitest";
import { orderHeaderReason } from "@/lib/orders/order-header";

test("omitted, null, false, and blank header aliases pass", () => {
  expect(orderHeaderReason(undefined)).toBeNull();
  expect(orderHeaderReason(null, null, null)).toBeNull();
  expect(orderHeaderReason(false, "", "  ")).toBeNull();
});

test("a present header alias is refused and does not halt", () => {
  expect(orderHeaderReason("hedge note")).toBe(
    "Header is not supported; the adapter would place a plain spot order",
  );
  expect(orderHeaderReason(0)).toBe(
    "Header is not supported; the adapter would place a plain spot order",
  );
  expect(orderHeaderReason(undefined, "client memo")).toBe(
    "Order header is not supported; the adapter would place a plain spot order",
  );
  expect(orderHeaderReason(undefined, undefined, true)).toBe(
    "Client header is not supported; the adapter would place a plain spot order",
  );
});
