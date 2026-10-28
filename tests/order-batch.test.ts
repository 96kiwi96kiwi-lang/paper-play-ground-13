import { expect, test } from "vitest";
import { orderBatchReason } from "@/lib/orders/order-batch";

test("omitted, null, false, and blank batch aliases pass", () => {
  expect(orderBatchReason(undefined)).toBeNull();
  expect(orderBatchReason(null, null, null)).toBeNull();
  expect(orderBatchReason(false, "", "  ")).toBeNull();
});

test("a present batch alias is refused and does not halt", () => {
  expect(orderBatchReason("batch-abc123")).toBe(
    "Batch is not supported; the adapter would place a plain spot order",
  );
  expect(orderBatchReason(0)).toBe(
    "Batch is not supported; the adapter would place a plain spot order",
  );
  expect(orderBatchReason(undefined, "ord-batch")).toBe(
    "Order batch is not supported; the adapter would place a plain spot order",
  );
  expect(orderBatchReason(undefined, undefined, true)).toBe(
    "Client batch is not supported; the adapter would place a plain spot order",
  );
});
