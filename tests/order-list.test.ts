import { expect, test } from "vitest";
import { orderListReason } from "@/lib/orders/order-list";

test("omitted, null, false, and blank order-list fields pass", () => {
  expect(orderListReason(undefined)).toBeNull();
  expect(orderListReason(null, null, null, null, null, null)).toBeNull();
  expect(orderListReason(false, "", "  ", "\t", "", "")).toBeNull();
});

test("present order-list fields are refused and do not halt", () => {
  expect(orderListReason(true)).toBe(
    "OCO is not supported; the adapter places one spot order",
  );
  expect(orderListReason(undefined, "list-1")).toBe(
    "Order list id is not supported; the adapter places one spot order",
  );
  expect(orderListReason(undefined, undefined, "oco-1")).toBe(
    "List client order id is not supported; the adapter places one spot order",
  );
  expect(orderListReason(undefined, undefined, undefined, "LIMIT_MAKER")).toBe(
    "Above type is not supported; the adapter places one spot order",
  );
  expect(orderListReason(undefined, undefined, undefined, undefined, "STOP_LOSS_LIMIT")).toBe(
    "Below type is not supported; the adapter places one spot order",
  );
  expect(orderListReason(undefined, undefined, undefined, undefined, undefined, 0)).toBe(
    "Stop limit price is not supported; the adapter places one spot order",
  );
});
