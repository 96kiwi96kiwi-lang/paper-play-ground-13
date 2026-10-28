import { expect, test } from "vitest";
import { orderRemarkReason } from "@/lib/orders/order-remark";

test("omitted, blank, and false pass", () => {
  expect(orderRemarkReason(undefined)).toBeNull();
  expect(orderRemarkReason(null, null, null)).toBeNull();
  expect(orderRemarkReason("", "  ", false)).toBeNull();
  expect(orderRemarkReason(false, false, false)).toBeNull();
});

test("a present remark is refused and does not halt", () => {
  expect(orderRemarkReason("grid-rmk")).toBe(
    "Order remark is not supported; the adapter would place a plain spot order",
  );
  expect(orderRemarkReason(0)).toBe(
    "Order remark is not supported; the adapter would place a plain spot order",
  );
  expect(orderRemarkReason(undefined, "bybit-rmk")).toBe(
    "Order remark alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderRemarkReason(undefined, undefined, "client-rmk")).toBe(
    "Client remark alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderRemarkReason(undefined, undefined, true)).toBe(
    "Client remark alias is not supported; the adapter would place a plain spot order",
  );
});
