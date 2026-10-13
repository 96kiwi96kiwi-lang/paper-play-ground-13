import { expect, test } from "vitest";
import { orderForceReason } from "@/lib/orders/order-force";

test("omitted, blank, and false pass", () => {
  expect(orderForceReason(undefined)).toBeNull();
  expect(orderForceReason(null, null, null)).toBeNull();
  expect(orderForceReason("", "  ", false)).toBeNull();
  expect(orderForceReason(false, false, false)).toBeNull();
});

test("a present order force is refused and does not halt", () => {
  expect(orderForceReason("ioc")).toBe(
    "Order force is not supported; the adapter would rest the order as GTC",
  );
  expect(orderForceReason("post_only")).toBe(
    "Order force is not supported; the adapter would rest the order as GTC",
  );
  expect(orderForceReason(undefined, "fok")).toBe(
    "Force type is not supported; the adapter would rest the order as GTC",
  );
  expect(orderForceReason(undefined, undefined, "ioc")).toBe(
    "Order-force alias is not supported; the adapter would rest the order as GTC",
  );
  expect(orderForceReason(undefined, undefined, 0)).toBe(
    "Order-force alias is not supported; the adapter would rest the order as GTC",
  );
});
