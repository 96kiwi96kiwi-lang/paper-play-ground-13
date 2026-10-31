import { expect, test } from "vitest";
import { orderIdReason } from "@/lib/orders/order-id";

test("omitted, null, false, and blank id aliases pass", () => {
  expect(orderIdReason(undefined)).toBeNull();
  expect(orderIdReason(null, null, null)).toBeNull();
  expect(orderIdReason(false, "", "  ")).toBeNull();
});

test("a present id alias is refused and does not halt", () => {
  expect(orderIdReason("abc123")).toBe(
    "Id is not supported; the adapter would place a plain spot order",
  );
  expect(orderIdReason(0)).toBe(
    "Id is not supported; the adapter would place a plain spot order",
  );
  expect(orderIdReason(undefined, "ord-id")).toBe(
    "Order id is not supported; the adapter would place a plain spot order",
  );
  expect(orderIdReason(undefined, undefined, true)).toBe(
    "Client id is not supported; the adapter would place a plain spot order",
  );
});
