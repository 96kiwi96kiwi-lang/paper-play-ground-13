import { expect, test } from "vitest";
import { orderLinkReason } from "@/lib/orders/order-link";

test("omitted, null, false, and blank link aliases pass", () => {
  expect(orderLinkReason(undefined)).toBeNull();
  expect(orderLinkReason(null, null, null)).toBeNull();
  expect(orderLinkReason(false, "", "  ")).toBeNull();
});

test("a present link alias is refused and does not halt", () => {
  expect(orderLinkReason("abc-123")).toBe(
    "Client order id is not supported; the adapter identifies by clientOrderId",
  );
  expect(orderLinkReason(0)).toBe(
    "Client order id is not supported; the adapter identifies by clientOrderId",
  );
  expect(orderLinkReason(undefined, "link-1")).toBe(
    "Order link id is not supported; the adapter identifies by clientOrderId",
  );
  expect(orderLinkReason(undefined, undefined, true)).toBe(
    "Link id is not supported; the adapter identifies by clientOrderId",
  );
});
