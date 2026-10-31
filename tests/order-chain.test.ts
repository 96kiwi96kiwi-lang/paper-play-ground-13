import { expect, test } from "vitest";
import { orderChainReason } from "@/lib/orders/order-chain";

test("omitted, null, false, and blank chain aliases pass", () => {
  expect(orderChainReason(undefined)).toBeNull();
  expect(orderChainReason(null, null, null)).toBeNull();
  expect(orderChainReason(false, "", "  ")).toBeNull();
});

test("a present chain alias is refused and does not halt", () => {
  expect(orderChainReason("chain-1")).toBe(
    "Chain id is not supported; the adapter would place a plain spot order",
  );
  expect(orderChainReason(0)).toBe(
    "Chain id is not supported; the adapter would place a plain spot order",
  );
  expect(orderChainReason(undefined, "ord-chain")).toBe(
    "Order chain is not supported; the adapter would place a plain spot order",
  );
  expect(orderChainReason(undefined, undefined, true)).toBe(
    "Client chain is not supported; the adapter would place a plain spot order",
  );
});
