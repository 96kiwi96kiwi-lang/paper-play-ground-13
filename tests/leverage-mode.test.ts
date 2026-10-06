import { expect, test } from "vitest";
import { leverageModeReason } from "@/lib/orders/leverage-mode";

test("omitted, null, false, and blank leverage pass", () => {
  expect(leverageModeReason(undefined)).toBeNull();
  expect(leverageModeReason(null, null, null)).toBeNull();
  expect(leverageModeReason(false, "", "  ")).toBeNull();
});

test("a present leverage or margin mode is refused and does not halt", () => {
  expect(leverageModeReason(3)).toBe(
    "Leverage is not supported; the adapter would place a plain spot order",
  );
  expect(leverageModeReason(0)).toBe(
    "Leverage is not supported; the adapter would place a plain spot order",
  );
  expect(leverageModeReason(undefined, "isolated")).toBe(
    "Margin mode is not supported; the adapter would place a plain spot order",
  );
  expect(leverageModeReason(undefined, undefined, "cross")).toBe(
    "Trade mode is not supported; the adapter would place a plain spot order",
  );
});
