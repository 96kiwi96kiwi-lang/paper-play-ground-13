import { expect, test } from "vitest";
import { orderTokenReason } from "@/lib/orders/order-token";

test("omitted, null, false, and blank token aliases pass", () => {
  expect(orderTokenReason(undefined)).toBeNull();
  expect(orderTokenReason(null, null, null)).toBeNull();
  expect(orderTokenReason(false, "", "  ")).toBeNull();
});

test("a present token alias is refused and does not halt", () => {
  expect(orderTokenReason("bearer-xyz789")).toBe(
    "Token is not supported; the adapter would place a plain spot order",
  );
  expect(orderTokenReason(0)).toBe(
    "Token is not supported; the adapter would place a plain spot order",
  );
  expect(orderTokenReason(undefined, "ord-tok")).toBe(
    "Order token is not supported; the adapter would place a plain spot order",
  );
  expect(orderTokenReason(undefined, undefined, true)).toBe(
    "Client token is not supported; the adapter would place a plain spot order",
  );
});
