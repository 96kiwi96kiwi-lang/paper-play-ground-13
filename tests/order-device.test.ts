import { expect, test } from "vitest";
import { orderDeviceReason } from "@/lib/orders/order-device";

test("omitted, null, false, and blank device aliases pass", () => {
  expect(orderDeviceReason(undefined)).toBeNull();
  expect(orderDeviceReason(null, null, null)).toBeNull();
  expect(orderDeviceReason(false, "", "  ")).toBeNull();
});

test("a present device alias is refused and does not halt", () => {
  expect(orderDeviceReason("mobile")).toBe(
    "Device is not supported; the adapter would place a plain spot order",
  );
  expect(orderDeviceReason(0)).toBe(
    "Device is not supported; the adapter would place a plain spot order",
  );
  expect(orderDeviceReason(undefined, "ord-dev")).toBe(
    "Order device is not supported; the adapter would place a plain spot order",
  );
  expect(orderDeviceReason(undefined, undefined, true)).toBe(
    "Client device is not supported; the adapter would place a plain spot order",
  );
});
