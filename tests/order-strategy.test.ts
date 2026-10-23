import { expect, test } from "vitest";
import { orderStrategyReason } from "@/lib/orders/order-strategy";

test("omitted, null, false, and blank strategy aliases pass", () => {
  expect(orderStrategyReason(undefined)).toBeNull();
  expect(orderStrategyReason(null, null, null)).toBeNull();
  expect(orderStrategyReason(false, "", "  ")).toBeNull();
});

test("a present strategy alias is refused and does not halt", () => {
  expect(orderStrategyReason("grid-v1")).toBe(
    "Strategy is not supported; the adapter would place a plain spot order",
  );
  expect(orderStrategyReason(0)).toBe(
    "Strategy is not supported; the adapter would place a plain spot order",
  );
  expect(orderStrategyReason(undefined, "strat-42")).toBe(
    "Strategy id is not supported; the adapter would place a plain spot order",
  );
  expect(orderStrategyReason(undefined, undefined, true)).toBe(
    "Client strategy is not supported; the adapter would place a plain spot order",
  );
});
