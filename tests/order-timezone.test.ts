import { expect, test } from "vitest";
import { orderTimezoneReason } from "@/lib/orders/order-timezone";

test("omitted, null, false, and blank timezone aliases pass", () => {
  expect(orderTimezoneReason(undefined)).toBeNull();
  expect(orderTimezoneReason(null, null, null)).toBeNull();
  expect(orderTimezoneReason(false, "", "  ")).toBeNull();
});

test("a present timezone alias is refused and does not halt", () => {
  expect(orderTimezoneReason("UTC")).toBe(
    "Timezone is not supported; the adapter would place a plain spot order",
  );
  expect(orderTimezoneReason(0)).toBe(
    "Timezone is not supported; the adapter would place a plain spot order",
  );
  expect(orderTimezoneReason(undefined, "ord-tz")).toBe(
    "Order timezone is not supported; the adapter would place a plain spot order",
  );
  expect(orderTimezoneReason(undefined, undefined, true)).toBe(
    "Client timezone is not supported; the adapter would place a plain spot order",
  );
});
