import { expect, test } from "vitest";
import {
  inventoryReserveSellReason,
  workingSellReservedAmount,
} from "@/lib/orders/inventory-reserve";

test("buys skip the inventory-reserve floor", () => {
  expect(inventoryReserveSellReason("buy", 0, 1, 99, "BTC/USDT")).toBeNull();
});

test("sell within free inventory is allowed", () => {
  expect(inventoryReserveSellReason("sell", 1, 0.4, 0.2, "ETH/USDT")).toBeNull();
});

test("sell that looks fine on book size is refused when working sells already reserved the units", () => {
  const reason = inventoryReserveSellReason("sell", 1, 0.6, 0.5, "ETH/USDT");
  expect(reason).toMatch(/Inventory/i);
  expect(reason).toMatch(/reserved working sells/);
});

test("working sell remaining size is reserved per symbol", () => {
  const reserved = workingSellReservedAmount("ETH/USDT", [
    { symbol: "ETH/USDT", side: "sell", status: "open", amount: 0.4, filled: 0, remaining: 0.4 },
    { symbol: "ETH/USDT", side: "buy", status: "open", amount: 2, remaining: 2 },
    { symbol: "BTC/USDT", side: "sell", status: "open", amount: 9, remaining: 9 },
    { symbol: "ETH/USDT", side: "sell", status: "filled", amount: 0.3, filled: 0.3, remaining: 0 },
    { symbol: "ETH/USDT", side: "sell", status: "partially_filled", amount: 0.5, filled: 0.2, remaining: 0.3 },
  ]);
  expect(reserved).toBeCloseTo(0.7);
});
