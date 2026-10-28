import { expect, test } from "vitest";
import { orderUserReason } from "@/lib/orders/order-user";

test("omitted, null, false, and blank user aliases pass", () => {
  expect(orderUserReason(undefined)).toBeNull();
  expect(orderUserReason(null, null, null)).toBeNull();
  expect(orderUserReason(false, "", "  ")).toBeNull();
});

test("a present user alias is refused and does not halt", () => {
  expect(orderUserReason("hedge note")).toBe(
    "User is not supported; the adapter would place a plain spot order",
  );
  expect(orderUserReason(0)).toBe(
    "User is not supported; the adapter would place a plain spot order",
  );
  expect(orderUserReason(undefined, "client memo")).toBe(
    "Order user is not supported; the adapter would place a plain spot order",
  );
  expect(orderUserReason(undefined, undefined, true)).toBe(
    "Client user is not supported; the adapter would place a plain spot order",
  );
});
