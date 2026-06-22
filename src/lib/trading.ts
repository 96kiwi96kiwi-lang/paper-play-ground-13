export type CoinId = "bitcoin" | "ethereum" | "solana" | "binancecoin";

export const COINS: { id: CoinId; symbol: string; name: string }[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
];

export type Strategy = "momentum" | "mean_reversion" | "rsi";

export interface PricePoint {
  t: number;
  price: number;
}

export interface Position {
  coin: CoinId;
  amount: number; // coin units
  avgEntry: number;
}

export interface Trade {
  id: string;
  ts: number;
  coin: CoinId;
  action: "BUY" | "SELL";
  price: number;
  amount: number; // coin units
  usd: number;
  reason: string;
}

export function fmtUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function fmtPct(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function rsi(prices: number[], period = 14): number | null {
  if (prices.length < period + 1) return null;
  const slice = prices.slice(-period - 1);
  let gains = 0, losses = 0;
  for (let i = 1; i < slice.length; i++) {
    const d = slice[i] - slice[i - 1];
    if (d >= 0) gains += d; else losses -= d;
  }
  const avgG = gains / period;
  const avgL = losses / period;
  if (avgL === 0) return 100;
  const rs = avgG / avgL;
  return 100 - 100 / (1 + rs);
}

export function pctChangeSince(history: PricePoint[], msAgo: number): number | null {
  if (history.length < 2) return null;
  const now = history[history.length - 1];
  const cutoff = now.t - msAgo;
  let ref: PricePoint | null = null;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].t <= cutoff) { ref = history[i]; break; }
  }
  if (!ref) ref = history[0];
  return ((now.price - ref.price) / ref.price) * 100;
}

export function avgSince(history: PricePoint[], msAgo: number): number | null {
  if (history.length === 0) return null;
  const cutoff = history[history.length - 1].t - msAgo;
  const slice = history.filter((p) => p.t >= cutoff);
  if (slice.length === 0) return null;
  return slice.reduce((s, p) => s + p.price, 0) / slice.length;
}
