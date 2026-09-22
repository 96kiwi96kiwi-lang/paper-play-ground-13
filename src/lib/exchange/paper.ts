/**
 * Paper exchange adapter
 * Simulates balance + orders using in-memory state (or localStorage on client).
 * Prices still come from CoinGecko (passed in from outside).
 */

import type {
  ExchangeAdapter,
  UnifiedBalance,
  UnifiedOrder,
  UnifiedTicker,
  Side,
} from "./types";

export class PaperExchange implements ExchangeAdapter {
  name = "paper" as const;

  private cash: number;
  private positions: Record<string, { amount: number; avgEntry: number }> = {};
  private orders: UnifiedOrder[] = [];
  private orderIdCounter = 1;

  constructor(startingBalance = 10_000) {
    this.cash = startingBalance;
  }

  /** Allow external price injection (from CoinGecko) */
  private latestTickers: Record<string, UnifiedTicker> = {};

  setTickers(tickers: Record<string, UnifiedTicker>) {
    this.latestTickers = tickers;
  }

  async fetchBalance(): Promise<UnifiedBalance> {
    return {
      free: this.cash,
      used: 0,
      total: this.cash,
    };
  }

  async fetchTickers(symbols: string[]): Promise<Record<string, UnifiedTicker>> {
    const result: Record<string, UnifiedTicker> = {};
    for (const s of symbols) {
      if (this.latestTickers[s]) {
        result[s] = this.latestTickers[s];
      }
    }
    return result;
  }

  async placeMarketOrder(
    symbol: string,
    side: Side,
    amount: number,
  ): Promise<UnifiedOrder> {
    const ticker = this.latestTickers[symbol];
    if (!ticker || ticker.last <= 0) {
      throw new Error(`No price available for ${symbol}`);
    }

    const price = ticker.last;
    const cost = amount * price;

    if (side === "buy") {
      if (cost > this.cash) {
        throw new Error("Insufficient paper balance");
      }
      this.cash -= cost;
      const existing = this.positions[symbol];
      if (existing) {
        const totalAmount = existing.amount + amount;
        const totalCost = existing.amount * existing.avgEntry + cost;
        this.positions[symbol] = {
          amount: totalAmount,
          avgEntry: totalCost / totalAmount,
        };
      } else {
        this.positions[symbol] = { amount, avgEntry: price };
      }
    } else {
      const pos = this.positions[symbol];
      if (!pos || pos.amount < amount) {
        throw new Error("Insufficient position to sell");
      }
      this.cash += cost;
      pos.amount -= amount;
      if (pos.amount <= 1e-8) {
        delete this.positions[symbol];
      }
    }

    const order: UnifiedOrder = {
      id: `paper-${this.orderIdCounter++}`,
      symbol,
      side,
      type: "market",
      amount,
      price,
      status: "closed",
      filled: amount,
      cost,
      timestamp: Date.now(),
    };
    this.orders.unshift(order);
    return order;
  }

  async placeLimitOrder(
    symbol: string,
    side: Side,
    amount: number,
    price: number,
  ): Promise<UnifiedOrder> {
    // For paper simplicity we treat limit as immediate market at given price
    const ticker = this.latestTickers[symbol] ?? {
      symbol,
      last: price,
      bid: price,
      ask: price,
      timestamp: Date.now(),
    };
    this.latestTickers[symbol] = { ...ticker, last: price };
    return this.placeMarketOrder(symbol, side, amount);
  }

  async cancelOrder(_orderId: string, _symbol: string): Promise<void> {
    // Paper market orders are filled immediately → nothing to cancel
  }

  async fetchOpenOrders(_symbol?: string): Promise<UnifiedOrder[]> {
    return [];
  }

  async healthCheck() {
    return { ok: true, message: "Paper mode active" };
  }

  // Helpers for the UI / bot engine
  getPositions() {
    return { ...this.positions };
  }

  getCash() {
    return this.cash;
  }

  getTradeHistory() {
    return [...this.orders];
  }
}
