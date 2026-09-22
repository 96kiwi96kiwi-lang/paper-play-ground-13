/**
 * Trading configuration
 * =====================
 * Default = PAPER mode (safe).
 * Live mode requires explicit enable + valid KuCoin API keys.
 */

export type TradingMode = "paper" | "live";
export type StrategyId = "momentum" | "mean_reversion" | "rsi" | "grid";

export const TRADING_CONFIG = {
  // Default mode – NEVER change this to "live" without explicit user action
  mode: "paper" as TradingMode,

  // Starting virtual balance for paper mode
  paperStartingBalance: 10_000,

  // Supported pairs on KuCoin (spot)
  pairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"] as const,

  // Default strategy
  defaultStrategy: "momentum" as StrategyId,

  // Risk limits (shared between paper & live)
  risk: {
    tradeSizePct: 0.15,          // 15 % of portfolio per trade
    maxPositionPct: 0.20,        // max 20 % in one coin
    stopLossPct: -4,             // tighter than original
    takeProfitPct: 6,
    dailyLossLimitPct: -10,
    maxDrawdownPct: -18,
    maxOpenPositions: 3,
    losingStreakHardStop: 4,
  },

  // Bot timing
  priceRefreshMs: 20_000,
  botTickMs: 45_000,

  // KuCoin specific (filled from env on server)
  kucoin: {
    // These are placeholders – real values come from process.env on server
    apiKey: "",
    secret: "",
    password: "", // KuCoin passphrase
    sandbox: false, // set true for KuCoin sandbox if available
  },
} as const;

export type Pair = (typeof TRADING_CONFIG.pairs)[number];
