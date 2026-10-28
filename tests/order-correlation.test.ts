import { expect, test } from "vitest";
import { orderCorrelationReason } from "@/lib/orders/order-correlation";

test("omitted, null, false, and blank correlation aliases pass", () => {
  expect(orderCorrelationReason(undefined)).toBeNull();
  expect(orderCorrelationReason(null, null, null)).toBeNull();
  expect(orderCorrelationReason(false, "", "  ")).toBeNull();
});

test("a present correlation alias is refused and does not halt", () => {
  expect(orderCorrelationReason("corr-abc123")).toBe(
    "Correlation is not supported; the adapter would place a plain spot order",
  );
  expect(orderCorrelationReason(0)).toBe(
    "Correlation is not supported; the adapter would place a plain spot order",
  );
  expect(orderCorrelationReason(undefined, "ord-corr")).toBe(
    "Order correlation is not supported; the adapter would place a plain spot order",
  );
  expect(orderCorrelationReason(undefined, undefined, true)).toBe(
    "Client correlation is not supported; the adapter would place a plain spot order",
  );
});
