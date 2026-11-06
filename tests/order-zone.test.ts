import { expect, test } from "vitest";
import { orderZoneReason } from "@/lib/orders/order-zone";

test("omitted, blank, and false pass", () => {
  expect(orderZoneReason(undefined)).toBeNull();
  expect(orderZoneReason(null, null, null)).toBeNull();
  expect(orderZoneReason("", "  ", false)).toBeNull();
  expect(orderZoneReason(false, false, false)).toBeNull();
});

test("a present zone is refused and does not halt", () => {
  expect(orderZoneReason("utc")).toBe(
    "Order zone is not supported; the adapter would place a plain spot order",
  );
  expect(orderZoneReason(0)).toBe(
    "Order zone is not supported; the adapter would place a plain spot order",
  );
  expect(orderZoneReason(undefined, "session")).toBe(
    "Order zone alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderZoneReason(undefined, undefined, "client-zone")).toBe(
    "Client zone alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderZoneReason(undefined, undefined, true)).toBe(
    "Client zone alias is not supported; the adapter would place a plain spot order",
  );
});
