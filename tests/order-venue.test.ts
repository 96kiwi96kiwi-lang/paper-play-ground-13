import { expect, test } from "vitest";
import { orderVenueReason } from "@/lib/orders/order-venue";

test("omitted, blank, and false pass", () => {
  expect(orderVenueReason(undefined)).toBeNull();
  expect(orderVenueReason(null, null, null)).toBeNull();
  expect(orderVenueReason("", "  ", false)).toBeNull();
  expect(orderVenueReason(false, false, false)).toBeNull();
});

test("a present venue is refused and does not halt", () => {
  expect(orderVenueReason("kucoin-margin")).toBe(
    "Order venue is not supported; the adapter would place a plain spot order",
  );
  expect(orderVenueReason(0)).toBe(
    "Order venue is not supported; the adapter would place a plain spot order",
  );
  expect(orderVenueReason(undefined, "binance")).toBe(
    "Order venue alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderVenueReason(undefined, undefined, "client-venue")).toBe(
    "Client venue alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderVenueReason(undefined, undefined, true)).toBe(
    "Client venue alias is not supported; the adapter would place a plain spot order",
  );
});
