import { expect, test } from "vitest";
import { priceProtectReason } from "@/lib/orders/price-protect";

test("omitted, null, false, and blank price-protect fields pass", () => {
  expect(priceProtectReason(undefined)).toBeNull();
  expect(priceProtectReason(null, null, null)).toBeNull();
  expect(priceProtectReason(false, "", "  ")).toBeNull();
});

test("present price-protect fields are refused and do not halt", () => {
  expect(priceProtectReason(true)).toBe(
    "Price protect is not supported; the adapter would place without an exchange price band",
  );
  expect(priceProtectReason(undefined, "TRUE")).toBe(
    "Price protection is not supported; the adapter would place without an exchange price band",
  );
  expect(priceProtectReason(undefined, undefined, 0)).toBe(
    "Percent price is not supported; the adapter would place without an exchange price band",
  );
});
