import { expect, test } from "vitest";
import { quoteSizeReason } from "@/lib/orders/quote-size";

test("omitted and blank quote sizes pass", () => {
  expect(quoteSizeReason(undefined, "Funds")).toBeNull();
  expect(quoteSizeReason(null, "Funds")).toBeNull();
  expect(quoteSizeReason("", "Quote order qty")).toBeNull();
  expect(quoteSizeReason("  ", "Quote qty")).toBeNull();
});

test("a present quote size is refused and does not halt", () => {
  expect(quoteSizeReason(25, "Funds")).toBe(
    "Funds is not supported; the adapter sizes by base amount only",
  );
  expect(quoteSizeReason("10", "Quote order qty")).toBe(
    "Quote order qty is not supported; the adapter sizes by base amount only",
  );
  expect(quoteSizeReason(0, "Quote qty")).toBe(
    "Quote qty is not supported; the adapter sizes by base amount only",
  );
});
