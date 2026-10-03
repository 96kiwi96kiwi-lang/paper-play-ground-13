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

  // Supported pairs on KuCoin (spot) — OrderManager refuses anything else
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
    /** Max accepted orders (buy or sell) per UTC day. Not a hard-stop — just refuse new submits. */
    maxDailyTrades: 12,
    /** Max accepted orders (buy or sell) per symbol per UTC day. Not a halt. */
    maxDailyTradesPerSymbol: 5,
    /** Keep at least this much cash; buys that would breach it are refused (not a halt). */
    minCashReserveUsd: 500,
  },

  // Grid strategy (Hour 7+)
  grid: {
    levels: 8,
    spacingPct: 0.8, // percent between adjacent levels
    takerFeePct: 0.1, // KuCoin spot taker ~0.1%
    minNetEdgeMultiplier: 2.2, // spacing must cover >2x round-trip fee
    rebalanceThresholdPct: 6, // recenter when price walks this far off mid
    recenterLookback: 40,
    /** Do not flip buy↔sell until this many ms after the last grid fill. */
    minHoldMs: 3 * 60 * 1000,
    /** Require price to walk this many extra rungs before flipping side. */
    minLevelsBeforeFlip: 2,
    /** Max unclosed grid buys on one symbol (inventory ladder). */
    maxStackedBuys: 3,
    /** Undo a rung reservation if the matching submit fails within this window. */
    reservationTtlMs: 2 * 60 * 1000,
  },

  // Order lifecycle
  orders: {
    /** Cancel resting limit / open orders older than this (ms). Market fills are ignored. */
    staleOpenOrderMs: 15 * 60 * 1000,
    /** Alert if no bot tick has been recorded for this long (ms). */
    staleHeartbeatMs: 3 * 45_000,
    /** Refuse a new submit if the last accepted one was more recent than this. */
    minSubmitIntervalMs: 8_000,
    /** Refuse opposite-side submits on the same symbol inside this window after an accepted order. */
    symbolFlipCooldownMs: 90_000,
    /** Refuse same-side submits on the same symbol inside this window after an accepted order. */
    sameSideCooldownMs: 25_000,
    /** Rolling window for adapter-reject burst floor (ms). */
    rejectBurstWindowMs: 10 * 60 * 1000,
    /** Refuse a new submit when this many adapter rejects are on the seen book inside the window. */
    maxRejectsInWindow: 4,
    /** Refuse a new submit when this many adapter rejects are on the seen book for that symbol inside the window. */
    maxRejectsPerSymbolInWindow: 3,
    /** Refuse a new submit while this many local working orders are still open / partial / pending. */
    maxConcurrentOpenOrders: 4,
    /** Refuse a new submit if this many working orders already exist on the same symbol. */
    maxOpenOrdersPerSymbol: 2,
    /** Refuse a submit while an opposite-side working order rests on the same symbol. */
    blockOppositeWorking: true,
    /** Refuse a limit while a same-side working order already rests inside this percent of the new price. */
    blockSamePriceWorking: true,
    /** Band (percent) for the same-price floor. Below grid.spacingPct so an adjacent rung still passes. */
    samePriceBandPct: 0.15,
    /** Refuse a limit closer than one grid rung to a same-side working price. */
    blockTightRung: true,
    /** Minimum percent between a new limit and a same-side working price. Matches grid.spacingPct. */
    minRungSpacingPct: 0.8,
    /** Refuse a buy limit at or above the mark, and a sell limit at or below it. */
    blockCrossMark: true,
    /** Refuse when amount * reference price exceeds this USD notional. Markets need price or markPrice. */
    maxOrderNotionalUsd: 2_500,
    /** Refuse when amount * reference price is below this USD notional. Markets need price or markPrice. */
    minOrderNotionalUsd: 12,
    /** Refuse a non-blank clientOrderId longer than this or outside [A-Za-z0-9-]. Blank still passes. KuCoin clientOid max is 40. */
    maxClientOrderIdLength: 40,
    /** Refuse a base amount with more than this many decimal places. KuCoin spot base increments are coarser than a raw float. */
    maxAmountDecimals: 8,
    /** Refuse a limit price with more than this many decimal places. KuCoin spot quote increments are coarser than a raw float. Market submits skip this. */
    maxPriceDecimals: 8,
    /** Refuse a buy when booked cost basis + this order notional would exceed this USD total. */
    maxGrossExposureUsd: 8_000,
    /** Refuse a buy when accepted buy notional on the UTC day plus this order would exceed this USD total. */
    maxDailyBuyNotionalUsd: 4_000,
    /** Refuse a buy when that symbol's accepted buy notional on the UTC day plus this order would exceed this USD total. */
    maxDailyBuyNotionalPerSymbolUsd: 1_800,
    /** Rolling window for the hourly buy-notional floor (ms). */
    hourlyBuyWindowMs: 60 * 60 * 1000,
    /** Refuse a buy when accepted buy notional inside hourlyBuyWindowMs plus this order would exceed this USD total. */
    maxHourlyBuyNotionalUsd: 1_500,
    /** Refuse a buy when that symbol's accepted buy notional inside the window plus this order would exceed this USD total. */
    maxHourlyBuyNotionalPerSymbolUsd: 800,
    /** Refuse a sell when accepted sell notional on the UTC day plus this order would exceed this USD total. */
    maxDailySellNotionalUsd: 6_000,
    /** Refuse a sell when that symbol's accepted sell notional on the UTC day plus this order would exceed this USD total. */
    maxDailySellNotionalPerSymbolUsd: 2_500,
    /** Rolling window for the hourly sell-notional floor (ms). */
    hourlySellWindowMs: 60 * 60 * 1000,
    /** Refuse a sell when accepted sell notional inside hourlySellWindowMs plus this order would exceed this USD total. */
    maxHourlySellNotionalUsd: 2_500,
    /** Refuse a sell when that symbol's accepted sell notional inside the window plus this order would exceed this USD total. */
    maxHourlySellNotionalPerSymbolUsd: 1_200,
    /** Refuse when remaining notional on working orders plus this submit would exceed this USD total. */
    maxWorkingNotionalUsd: 5_000,
    /** Refuse when remaining notional on working orders for this symbol plus this submit would exceed this USD total. */
    maxWorkingNotionalPerSymbolUsd: 2_500,
    /** Refuse market submits whose quote timestamp is older than this (ms). */
    maxPriceAgeMs: 90_000,
    /** Refuse a limit whose price is more than this percent away from markPrice. Market orders skip this. */
    maxLimitDeviationPct: 2.5,
    /** Refuse a buy after this many trailing accepted buys on the symbol with no accepted sell between them. */
    maxConsecutiveBuysPerSymbol: 4,
    /** Refuse a buy this long after a losing sell on the same symbol (ms). */
    lossReentryCooldownMs: 20 * 60 * 1000,
    /** A sell counts as losing when fill is at least this percent under book average entry. */
    lossReentryMinLossPct: 1,
    /** Refuse an add when mark is at least this percent under the open average entry. */
    maxAverageDownPct: 3,
    /** Refuse a buy this long after an accepted buy on the same symbol if the mark has run up (ms). */
    chaseUpWindowMs: 15 * 60 * 1000,
    /** Refuse a buy when mark is at least this percent above the latest accepted buy fill inside the window. */
    maxChaseUpPct: 2,
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
