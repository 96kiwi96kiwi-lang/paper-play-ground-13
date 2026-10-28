import { expect, test } from "vitest";
import { orderFingerprintReason } from "@/lib/orders/order-fingerprint";

test("omitted, null, false, and blank fingerprint aliases pass", () => {
  expect(orderFingerprintReason(undefined)).toBeNull();
  expect(orderFingerprintReason(null, null, null)).toBeNull();
  expect(orderFingerprintReason(false, "", "  ")).toBeNull();
});

test("a present fingerprint alias is refused and does not halt", () => {
  expect(orderFingerprintReason("hedge note")).toBe(
    "Order fingerprint is not supported; the adapter would place a plain spot order",
  );
  expect(orderFingerprintReason(0)).toBe(
    "Order fingerprint is not supported; the adapter would place a plain spot order",
  );
  expect(orderFingerprintReason(undefined, "client memo")).toBe(
    "Order fingerprint alias is not supported; the adapter would place a plain spot order",
  );
  expect(orderFingerprintReason(undefined, undefined, true)).toBe(
    "Client fingerprint alias is not supported; the adapter would place a plain spot order",
  );
});
