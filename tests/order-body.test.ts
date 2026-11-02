import { expect, test } from "vitest";
import { orderBodyReason } from "@/lib/orders/order-body";

test("omitted, null, false, and blank body aliases pass", () => {
  expect(orderBodyReason(undefined)).toBeNull();
  expect(orderBodyReason(null, null, null)).toBeNull();
  expect(orderBodyReason(false, "", "  ")).toBeNull();
});

test("a present body alias is refused and does not halt", () => {
  expect(orderBodyReason("hedge note")).toBe(
    "Body is not supported; the adapter would place a plain spot order",
  );
  expect(orderBodyReason(0)).toBe(
    "Body is not supported; the adapter would place a plain spot order",
  );
  expect(orderBodyReason(undefined, "client memo")).toBe(
    "Order body is not supported; the adapter would place a plain spot order",
  );
  expect(orderBodyReason(undefined, undefined, true)).toBe(
    "Client body is not supported; the adapter would place a plain spot order",
  );
});
