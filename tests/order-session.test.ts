import { expect, test } from "vitest";
import { orderSessionReason } from "@/lib/orders/order-session";

test("omitted, null, false, and blank session aliases pass", () => {
  expect(orderSessionReason(undefined)).toBeNull();
  expect(orderSessionReason(null, null, null)).toBeNull();
  expect(orderSessionReason(false, "", "  ")).toBeNull();
});

test("a present session alias is refused and does not halt", () => {
  expect(orderSessionReason("hedge note")).toBe(
    "Session is not supported; the adapter would place a plain spot order",
  );
  expect(orderSessionReason(0)).toBe(
    "Session is not supported; the adapter would place a plain spot order",
  );
  expect(orderSessionReason(undefined, "client memo")).toBe(
    "Order session is not supported; the adapter would place a plain spot order",
  );
  expect(orderSessionReason(undefined, undefined, true)).toBe(
    "Client session is not supported; the adapter would place a plain spot order",
  );
});
