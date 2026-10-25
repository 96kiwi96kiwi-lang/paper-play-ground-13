import { expect, test } from "vitest";
import { orderSignatureReason } from "@/lib/orders/order-signature";

test("omitted, null, false, and blank signature aliases pass", () => {
  expect(orderSignatureReason(undefined)).toBeNull();
  expect(orderSignatureReason(null, null, null)).toBeNull();
  expect(orderSignatureReason(false, "", "  ")).toBeNull();
});

test("a present signature alias is refused and does not halt", () => {
  expect(orderSignatureReason("ed25519-abc123")).toBe(
    "Signature is not supported; the adapter would place a plain spot order",
  );
  expect(orderSignatureReason(0)).toBe(
    "Signature is not supported; the adapter would place a plain spot order",
  );
  expect(orderSignatureReason(undefined, "ord-sig")).toBe(
    "Order signature is not supported; the adapter would place a plain spot order",
  );
  expect(orderSignatureReason(undefined, undefined, true)).toBe(
    "Client signature is not supported; the adapter would place a plain spot order",
  );
});
