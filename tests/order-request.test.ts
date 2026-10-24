import { expect, test } from "vitest";
import { orderRequestReason } from "@/lib/orders/order-request";

test("omitted, null, false, and blank request id aliases pass", () => {
  expect(orderRequestReason(undefined)).toBeNull();
  expect(orderRequestReason(null, null, null)).toBeNull();
  expect(orderRequestReason(false, "", "  ")).toBeNull();
});

test("a present request id alias is refused and does not halt", () => {
  expect(orderRequestReason("req-123")).toBe(
    "Request id is not supported; the adapter would place a plain spot order",
  );
  expect(orderRequestReason(0)).toBe(
    "Request id is not supported; the adapter would place a plain spot order",
  );
  expect(orderRequestReason(undefined, "ord-req-456")).toBe(
    "Order request id is not supported; the adapter would place a plain spot order",
  );
  expect(orderRequestReason(undefined, undefined, true)).toBe(
    "Client request id is not supported; the adapter would place a plain spot order",
  );
});
