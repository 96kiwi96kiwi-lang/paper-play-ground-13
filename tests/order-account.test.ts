import { expect, test } from "vitest";
import { orderAccountReason } from "@/lib/orders/order-account";

test("omitted, null, false, and blank account aliases pass", () => {
  expect(orderAccountReason(undefined)).toBeNull();
  expect(orderAccountReason(null, null, null)).toBeNull();
  expect(orderAccountReason(false, "", "  ")).toBeNull();
});

test("a present account alias is refused and does not halt", () => {
  expect(orderAccountReason("subaccount-1")).toBe(
    "Account is not supported; the adapter would place a plain spot order",
  );
  expect(orderAccountReason(0)).toBe(
    "Account is not supported; the adapter would place a plain spot order",
  );
  expect(orderAccountReason(undefined, "trading-wallet")).toBe(
    "Order account is not supported; the adapter would place a plain spot order",
  );
  expect(orderAccountReason(undefined, undefined, true)).toBe(
    "Client account is not supported; the adapter would place a plain spot order",
  );
});
