import { expect, test } from "vitest";
import { orderCurrencyReason } from "@/lib/orders/order-currency";

test("omitted, null, false, and blank currency aliases pass", () => {
  expect(orderCurrencyReason(undefined)).toBeNull();
  expect(orderCurrencyReason(null, null, null)).toBeNull();
  expect(orderCurrencyReason(false, "", "  ")).toBeNull();
});

test("a present currency alias is refused and does not halt", () => {
  expect(orderCurrencyReason("USD")).toBe(
    "Currency is not supported; the adapter would place a plain spot order",
  );
  expect(orderCurrencyReason(0)).toBe(
    "Currency is not supported; the adapter would place a plain spot order",
  );
  expect(orderCurrencyReason(undefined, "ord-ccy")).toBe(
    "Order currency is not supported; the adapter would place a plain spot order",
  );
  expect(orderCurrencyReason(undefined, undefined, true)).toBe(
    "Client currency is not supported; the adapter would place a plain spot order",
  );
});
