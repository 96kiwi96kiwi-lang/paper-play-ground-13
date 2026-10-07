import { expect, test } from "vitest";
import { brokerAttributionReason } from "@/lib/orders/broker-attribution";

test("omitted, blank, and false pass", () => {
  expect(brokerAttributionReason(undefined)).toBeNull();
  expect(brokerAttributionReason(null, null, null)).toBeNull();
  expect(brokerAttributionReason("", "  ", false)).toBeNull();
  expect(brokerAttributionReason(false, false, false)).toBeNull();
});

test("a present broker field is refused and does not halt", () => {
  expect(brokerAttributionReason("broker-1")).toBe(
    "Broker id is not supported; the adapter would place without broker attribution",
  );
  expect(brokerAttributionReason(0)).toBe(
    "Broker id is not supported; the adapter would place without broker attribution",
  );
  expect(brokerAttributionReason(undefined, "client-9")).toBe(
    "Broker client id is not supported; the adapter would place without broker attribution",
  );
  expect(brokerAttributionReason(undefined, undefined, true)).toBe(
    "Rebate is not supported; the adapter would place without a rebate flag",
  );
  expect(brokerAttributionReason(undefined, undefined, "USDT")).toBe(
    "Rebate is not supported; the adapter would place without a rebate flag",
  );
});
