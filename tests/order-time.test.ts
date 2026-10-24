import { expect, test } from "vitest";
import { orderTimeReason } from "@/lib/orders/order-time";

test("omitted, null, false, and blank timestamp aliases pass", () => {
  expect(orderTimeReason(undefined)).toBeNull();
  expect(orderTimeReason(null, null, null)).toBeNull();
  expect(orderTimeReason(false, "", "  ")).toBeNull();
});

test("a present timestamp alias is refused and does not halt", () => {
  expect(orderTimeReason("2026-10-24T19:00:00Z")).toBe(
    "Timestamp is not supported; the adapter would place a plain spot order",
  );
  expect(orderTimeReason(0)).toBe(
    "Timestamp is not supported; the adapter would place a plain spot order",
  );
  expect(orderTimeReason(undefined, "ord-ts-456")).toBe(
    "Order timestamp is not supported; the adapter would place a plain spot order",
  );
  expect(orderTimeReason(undefined, undefined, true)).toBe(
    "Client timestamp is not supported; the adapter would place a plain spot order",
  );
});
