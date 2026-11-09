import { expect, test } from "vitest";
import { orderTacticReason } from "@/lib/orders/order-tactic";

test("omitted, null, false, and blank tactic aliases pass", () => {
  expect(orderTacticReason(undefined)).toBeNull();
  expect(orderTacticReason(null, null, null)).toBeNull();
  expect(orderTacticReason(false, "", "  ")).toBeNull();
});

test("a present tactic alias is refused and does not halt", () => {
  expect(orderTacticReason("playbook-v1")).toBe(
    "Tactic is not supported; the adapter would place a plain spot order",
  );
  expect(orderTacticReason(0)).toBe(
    "Tactic is not supported; the adapter would place a plain spot order",
  );
  expect(orderTacticReason(undefined, "tac-42")).toBe(
    "Tactic id is not supported; the adapter would place a plain spot order",
  );
  expect(orderTacticReason(undefined, undefined, true)).toBe(
    "Client tactic is not supported; the adapter would place a plain spot order",
  );
});
