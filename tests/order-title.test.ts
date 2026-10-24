import { expect, test } from "vitest";
import { orderTitleReason } from "@/lib/orders/order-title";

test("omitted, null, false, and blank title aliases pass", () => {
  expect(orderTitleReason(undefined)).toBeNull();
  expect(orderTitleReason(null, null, null)).toBeNull();
  expect(orderTitleReason(false, "", "  ")).toBeNull();
});

test("a present title alias is refused and does not halt", () => {
  expect(orderTitleReason("hedge note")).toBe(
    "Title is not supported; the adapter would place a plain spot order",
  );
  expect(orderTitleReason(0)).toBe(
    "Title is not supported; the adapter would place a plain spot order",
  );
  expect(orderTitleReason(undefined, "client memo")).toBe(
    "Order title is not supported; the adapter would place a plain spot order",
  );
  expect(orderTitleReason(undefined, undefined, true)).toBe(
    "Client title is not supported; the adapter would place a plain spot order",
  );
});
