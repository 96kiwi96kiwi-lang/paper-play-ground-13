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
  private clientOrderIndex = new Map<string, string>();

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
    clientOrderId?: string,
  ): Promise<UnifiedOrder> {
    if (clientOrderId) {
      const existingId = this.clientOrderIndex.get(clientOrderId);
      if (existingId) {
        const existing = this.orders.find((o) => o.id === existingId);
        if (existing) return existing;
      }
    }

    const ticker = this.latestTickers[symbol];
    if (!ticker || ticker.last <= 0) {
      return this.rejectOrder(symbol, side, "market", amount, undefined, clientOrderId, `No price available for ${symbol}`);
    }

    if (amount <= 0) {
      return this.rejectOrder(symbol, side, "market", amount, ticker.last, clientOrderId, "Amount must be positive");
    }

    const price = ticker.last;
    const cost = amount * price;

    if (side === "buy") {
      if (cost > this.cash) {
        return this.rejectOrder(symbol, side, "market", amount, price, clientOrderId, "Insufficient paper balance");
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
        return this.rejectOrder(symbol, side, "market", amount, price, clientOrderId, "Insufficient position to sell");
      }
      this.cash += cost;
      pos.amount -= amount;
      if (pos.amount <= 1e-8) {
        delete this.positions[symbol];
      }
    }

    const order: UnifiedOrder = {
      id: `paper-${this.orderIdCounter++}`,
      clientOrderId,
      symbol,
      side,
      type: "market",
      amount,
      price,
      status: "closed",
      filled: amount,
      remaining: 0,
      cost,
      timestamp: Date.now(),
    };
    this.orders.unshift(order);
    if (clientOrderId) this.clientOrderIndex.set(clientOrderId, order.id);
    return order;
  }

  async placeLimitOrder(
    symbol: string,
    side: Side,
    amount: number,
    price: number,
    clientOrderId?: string,
  ): Promise<UnifiedOrder> {
    // Paper treats limit as immediate fill at the given price (simulates crossing).
    const ticker = this.latestTickers[symbol] ?? {
      symbol,
      last: price,
      bid: price,
      ask: price,
      timestamp: Date.now(),
    };
    this.latestTickers[symbol] = { ...ticker, last: price };
    return this.placeMarketOrder(symbol, side, amount, clientOrderId);
  }

  async cancelOrder(_orderId: string, _symbol: string): Promise<void> {
    // Paper market orders are filled immediately → nothing to cancel
  }

  async fetchOpenOrders(_symbol?: string): Promise<UnifiedOrder[]> {
    return [];
  }

  async fetchOrder(orderId: string, _symbol: string): Promise<UnifiedOrder | null> {
    return this.orders.find((o) => o.id === orderId) ?? null;
  }

  async healthCheck() {
    return { ok: true, message: "Paper mode active" };
  }

  getPositions() {
    return { ...this.positions };
  }

  getCash() {
    return this.cash;
  }

  getTradeHistory() {
    return [...this.orders];
  }

  private rejectOrder(
    symbol: string,
    side: Side,
    type: "market" | "limit",
    amount: number,
    price: number | undefined,
    clientOrderId: string | undefined,
    reason: string,
  ): UnifiedOrder {
    const order: UnifiedOrder = {
      id: `paper-${this.orderIdCounter++}`,
      clientOrderId,
      symbol,
      side,
      type,
      amount,
      price,
      status: "rejected",
      filled: 0,
      remaining: amount,
      cost: 0,
      timestamp: Date.now(),
      rejectReason: reason,
    };
    this.orders.unshift(order);
    if (clientOrderId) this.clientOrderIndex.set(clientOrderId, order.id);
    return order;
  }
}
