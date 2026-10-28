import { expect, test } from "vitest";
import { orderNonceReason } from "@/lib/orders/order-nonce";

test("omitted, null, false, and blank nonce aliases pass", () => {
  expect(orderNonceReason(undefined)).toBeNull();
  expect(orderNonceReason(null, null, null)).toBeNull();
  expect(orderNonceReason(false, "", "  ")).toBeNull();
});

test("a present nonce alias is refused and does not halt", () => {
  expect(orderNonceReason("n-abc123")).toBe(
    "Nonce is not supported; the adapter would place a plain spot order",
  );
  expect(orderNonceReason(0)).toBe(
    "Nonce is not supported; the adapter would place a plain spot order",
  );
  expect(orderNonceReason(undefined, "ord-nonce")).toBe(
    "Order nonce is not supported; the adapter would place a plain spot order",
  );
  expect(orderNonceReason(undefined, undefined, true)).toBe(
    "Client nonce is not supported; the adapter would place a plain spot order",
  );
});
