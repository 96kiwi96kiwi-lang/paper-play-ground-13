import { expect, test } from "vitest";
import { execInstReason } from "@/lib/orders/exec-inst";

test("omitted, blank, and false pass", () => {
  expect(execInstReason(undefined)).toBeNull();
  expect(execInstReason(null, null, null)).toBeNull();
  expect(execInstReason("", "  ", false)).toBeNull();
  expect(execInstReason(false, false, false)).toBeNull();
});

test("a present execution instruction is refused and does not halt", () => {
  expect(execInstReason("PostOnly")).toBe(
    "Execution instruction is not supported; the adapter would place a normal spot order",
  );
  expect(execInstReason("ReduceOnly")).toBe(
    "Execution instruction is not supported; the adapter would place a normal spot order",
  );
  expect(execInstReason(undefined, "CloseOnTrigger")).toBe(
    "Execution-instruction alias is not supported; the adapter would place a normal spot order",
  );
  expect(execInstReason(undefined, undefined, "PostOnly")).toBe(
    "Instruction is not supported; the adapter would place a normal spot order",
  );
  expect(execInstReason(undefined, undefined, 0)).toBe(
    "Instruction is not supported; the adapter would place a normal spot order",
  );
});
