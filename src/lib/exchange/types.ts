/**
 * Unified exchange interface
 * Used by both Paper and Live modes so strategies stay mode-agnostic.
 */

export type Side = "buy" | "sell";

export type OrderStatus =
  | "pending"
  | "open"
  | "partially_filled"
  | "closed"
  | "rejected"
  | "canceled";

export interface UnifiedTicker {
  symbol: string; // e.g. "BTC/USDT"
  last: number;
  bid: number;
  ask: number;
  timestamp: number;
}

export interface UnifiedBalance {
  free: number; // available USDT
  used: number;
  total: number;
}

export interface UnifiedOrder {
  id: string;
  clientOrderId?: string;
  symbol: string;
  side: Side;
  type: "market" | "limit";
  amount: number;
  price?: number;
  status: OrderStatus | string;
  filled: number;
  remaining?: number;
  cost: number;
  timestamp: number;
  rejectReason?: string;
}

export interface PlaceOrderParams {
  symbol: string;
  side: Side;
  amount: number;
  price?: number;
  type?: "market" | "limit";
  clientOrderId?: string;
}

export interface ExchangeAdapter {
  name: "paper" | "kucoin";
  fetchBalance(): Promise<UnifiedBalance>;
  fetchTickers(symbols: string[]): Promise<Record<string, UnifiedTicker>>;
  placeMarketOrder(
    symbol: string,
    side: Side,
    amount: number,
    clientOrderId?: string,
  ): Promise<UnifiedOrder>;
  placeLimitOrder(
    symbol: string,
    side: Side,
    amount: number,
    price: number,
    clientOrderId?: string,
  ): Promise<UnifiedOrder>;
  cancelOrder(orderId: string, symbol: string): Promise<void>;
  fetchOpenOrders(symbol?: string): Promise<UnifiedOrder[]>;
  fetchOrder?(orderId: string, symbol: string): Promise<UnifiedOrder | null>;
  healthCheck(): Promise<{ ok: boolean; message: string }>;
}
