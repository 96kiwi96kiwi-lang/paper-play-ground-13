import { expect, test } from "vitest";
import { orderLocaleReason } from "@/lib/orders/order-locale";

test("omitted, null, false, and blank locale aliases pass", () => {
  expect(orderLocaleReason(undefined)).toBeNull();
  expect(orderLocaleReason(null, null, null)).toBeNull();
  expect(orderLocaleReason(false, "", "  ")).toBeNull();
});

test("a present locale alias is refused and does not halt", () => {
  expect(orderLocaleReason("en-US")).toBe(
    "Locale is not supported; the adapter would place a plain spot order",
  );
  expect(orderLocaleReason(0)).toBe(
    "Locale is not supported; the adapter would place a plain spot order",
  );
  expect(orderLocaleReason(undefined, "ord-locale")).toBe(
    "Order locale is not supported; the adapter would place a plain spot order",
  );
  expect(orderLocaleReason(undefined, undefined, true)).toBe(
    "Client locale is not supported; the adapter would place a plain spot order",
  );
});
