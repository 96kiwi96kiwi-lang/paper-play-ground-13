import { expect, test } from "vitest";
import { orderLinkReason } from "@/lib/orders/order-link";

test("omitted, blank, and false pass", () => {
  expect(orderLinkReason(undefined)).toBeNull();
  expect(orderLinkReason(null, null, null)).toBeNull();
  expect(orderLinkReason("", "  ", false)).toBeNull();
  expect(orderLinkReason(false, false, false)).toBeNull();
});

test("a present link id is refused and does not halt", () => {
  expect(orderLinkReason("okx-1")).toBe(
    "Client order id is not supported; the adapter identifies by clientOrderId",
  );
  expect(orderLinkReason(0)).toBe(
    "Client order id is not supported; the adapter identifies by clientOrderId",
  );
  expect(orderLinkReason(undefined, "bybit-9")).toBe(
    "Order link id is not supported; the adapter identifies by clientOrderId",
  );
  expect(orderLinkReason(undefined, undefined, "link-3")).toBe(
    "Link id is not supported; the adapter identifies by clientOrderId",
  );
  expect(orderLinkReason(undefined, undefined, true)).toBe(
    "Link id is not supported; the adapter identifies by clientOrderId",
  );
});
