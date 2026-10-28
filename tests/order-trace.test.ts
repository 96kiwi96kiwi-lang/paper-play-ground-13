import { expect, test } from "vitest";
import { orderTraceReason } from "@/lib/orders/order-trace";

test("omitted, null, false, and blank trace aliases pass", () => {
  expect(orderTraceReason(undefined)).toBeNull();
  expect(orderTraceReason(null, null, null)).toBeNull();
  expect(orderTraceReason(false, "", "  ")).toBeNull();
});

test("a present trace alias is refused and does not halt", () => {
  expect(orderTraceReason("trace-abc123")).toBe(
    "Trace is not supported; the adapter would place a plain spot order",
  );
  expect(orderTraceReason(0)).toBe(
    "Trace is not supported; the adapter would place a plain spot order",
  );
  expect(orderTraceReason(undefined, "ord-trace")).toBe(
    "Order trace is not supported; the adapter would place a plain spot order",
  );
  expect(orderTraceReason(undefined, undefined, true)).toBe(
    "Client trace is not supported; the adapter would place a plain spot order",
  );
});
