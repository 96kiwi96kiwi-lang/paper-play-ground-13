import { expect, test } from "vitest";
import { orderReviewReason } from "@/lib/orders/order-review";

test("omitted, null, false, and blank review aliases pass", () => {
  expect(orderReviewReason(undefined)).toBeNull();
  expect(orderReviewReason(null, null, null)).toBeNull();
  expect(orderReviewReason(false, "", "  ")).toBeNull();
});

test("a present review alias is refused and does not halt", () => {
  expect(orderReviewReason("hedge note")).toBe(
    "Order review is not supported; the adapter would place a plain spot order",
  );
  expect(orderReviewReason(0)).toBe(
    "Order review is not supported; the adapter would place a plain spot order",
  );
  expect(orderReviewReason(undefined, "client memo")).toBe(
    "Order review alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderReviewReason(undefined, undefined, true)).toBe(
    "Client review alias is not supported; the adapter would place a plain spot order",
  );
});
