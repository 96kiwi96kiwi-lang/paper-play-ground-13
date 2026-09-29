import { expect, test } from "vitest";
import { TRADING_CONFIG } from "@/config/trading";
import { cashReserveBuyReason } from "@/lib/orders/cash-reserve";

const reserve = TRADING_CONFIG.risk.minCashReserveUsd;

test("sells skip the cash-reserve floor", () => {
  expect(cashReserveBuyReason("sell", 100, 10_000, reserve)).toBeNull();
});

test("buy that leaves cash below reserve is refused", () => {
  const reason = cashReserveBuyReason("buy", 600, 200, reserve);
  expect(reason).toMatch(/Cash reserve/i);
  expect(reason).toMatch(/breach/);
});

test("buy that keeps the reserve sleeve is allowed", () => {
  expect(cashReserveBuyReason("buy", 2_000, 200, reserve)).toBeNull();
});

test("buy with unknown notional is refused when book cash is already near the floor", () => {
  const reason = cashReserveBuyReason("buy", reserve + 5, undefined, reserve);
  expect(reason).toMatch(/Cash reserve floor/i);
});
