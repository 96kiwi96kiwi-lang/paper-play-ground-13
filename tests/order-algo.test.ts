import { expect, test } from "vitest";
import { orderAlgoReason } from "@/lib/orders/order-algo";

test("omitted, null, false, and blank algo aliases pass", () => {
  expect(orderAlgoReason(undefined)).toBeNull();
  expect(orderAlgoReason(null, null, null)).toBeNull();
  expect(orderAlgoReason(false, "", "  ")).toBeNull();
});

test("a present algo alias is refused and does not halt", () => {
  expect(orderAlgoReason("twap")).toBe(
    "Algo is not supported; the adapter would place a plain spot order",
  );
  expect(orderAlgoReason(0)).toBe(
    "Algo is not supported; the adapter would place a plain spot order",
  );
  expect(orderAlgoReason(undefined, "iceberg")).toBe(
    "Algo type is not supported; the adapter would place a plain spot order",
  );
  expect(orderAlgoReason(undefined, undefined, true)).toBe(
    "Client algo is not supported; the adapter would place a plain spot order",
  );
});
