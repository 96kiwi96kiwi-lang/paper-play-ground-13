import { expect, test } from "vitest";
import { batchReason } from "@/lib/orders/batch";

test("omitted, null, false, and blank batch fields pass", () => {
  expect(batchReason(undefined)).toBeNull();
  expect(batchReason(null, null, null)).toBeNull();
  expect(batchReason(false, "", "  ")).toBeNull();
});

test("a present batch, batch id, or batch orders is refused and does not halt", () => {
  expect(batchReason(true)).toBe(
    "Batch is not supported; the adapter would place one plain spot order",
  );
  expect(batchReason(0)).toBe(
    "Batch is not supported; the adapter would place one plain spot order",
  );
  expect(batchReason(undefined, "batch-1")).toBe(
    "Batch id is not supported; the adapter would place one plain spot order",
  );
  expect(batchReason(undefined, undefined, "ord-1,ord-2")).toBe(
    "Batch orders is not supported; the adapter would place one plain spot order",
  );
});
