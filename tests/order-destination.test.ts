import { expect, test } from "vitest";
import { orderDestinationReason } from "@/lib/orders/order-destination";

test("omitted, blank, and false pass", () => {
  expect(orderDestinationReason(undefined)).toBeNull();
  expect(orderDestinationReason(null, null, null)).toBeNull();
  expect(orderDestinationReason("", "  ", false)).toBeNull();
  expect(orderDestinationReason(false, false, false)).toBeNull();
});

test("a present destination is refused and does not halt", () => {
  expect(orderDestinationReason("wallet-A")).toBe(
    "Order destination is not supported; the adapter would place a plain spot order",
  );
  expect(orderDestinationReason(0)).toBe(
    "Order destination is not supported; the adapter would place a plain spot order",
  );
  expect(orderDestinationReason(undefined, "sub-account-7")).toBe(
    "Order destination alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderDestinationReason(undefined, undefined, "client-dest")).toBe(
    "Client destination alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderDestinationReason(undefined, undefined, true)).toBe(
    "Client destination alias is not supported; the adapter would place a plain spot order",
  );
});
