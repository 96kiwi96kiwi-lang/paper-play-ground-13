/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 */

import { TRADING_CONFIG } from "@/config/trading";
import type { ExchangeAdapter, Side, UnifiedOrder } from "@/lib/exchange/types";
import { applyHardStops, evaluateRisk, type RiskState } from "@/lib/risk";
import { excessAmountDecimalsReason } from "./amount-precision";
import { excessPriceDecimalsReason } from "./price-precision";
import { averageDownReason } from "./average-down";
import { cashReserveBuyReason, workingBuyReservedUsd } from "./cash-reserve";
import { crossMarkReason } from "./cross-mark";
import { chaseUpReason, lastAcceptedBuyFill } from "./chase-up";
import { duplicateClientOrderIdReason, invalidClientOrderIdReason } from "./client-order-id";
import { consecutiveBuysReason, trailingAcceptedBuys } from "./consecutive-buys";
import {
  acceptedBuyNotionalOnUtcDay,
  acceptedBuyNotionalOnUtcDayForSymbol,
  dailyBuyNotionalPerSymbolReason,
  dailyBuyNotionalReason,
} from "./daily-buy-notional";
import {
  acceptedTradeCountOnUtcDayForSymbol,
  dailyTradeCapPerSymbolReason,
} from "./daily-trade-cap";
import {
  acceptedBuyNotionalInWindow,
  acceptedBuyNotionalInWindowForSymbol,
  hourlyBuyNotionalPerSymbolReason,
  hourlyBuyNotionalReason,
} from "./hourly-buy-notional";
import {
  acceptedSellNotionalOnUtcDay,
  acceptedSellNotionalOnUtcDayForSymbol,
  dailySellNotionalPerSymbolReason,
  dailySellNotionalReason,
} from "./daily-sell-notional";
import {
  acceptedSellNotionalInWindow,
  acceptedSellNotionalInWindowForSymbol,
  hourlySellNotionalPerSymbolReason,
  hourlySellNotionalReason,
} from "./hourly-sell-notional";
import { inventoryReserveSellReason, workingSellReservedAmount } from "./inventory-reserve";
import { limitPriceBandReason } from "./limit-price-band";
import { lastLosingSellAt, lossReentryReason } from "./loss-reentry";
import { openSlotReason, openSlotSymbols } from "./open-slots";
import {
  rejectBurstPerSymbolReason,
  rejectBurstReason,
  rejectedCountInWindow,
  rejectedCountInWindowForSymbol,
} from "./reject-burst";
import { sameSideCooldownReason } from "./same-side-cooldown";
import { samePriceWorkingReason } from "./same-price";
import { rungSpacingReason } from "./rung-spacing";
import { selfCrossReason } from "./self-cross";
import { sellDustRemainderReason } from "./sell-dust";
import { selectStaleOpenOrders, selectWorkingOrders } from "./stale-open";
import { staleMarketQuoteReason } from "./stale-quote";
import { marketReferencePrice, unpricedMarketReason } from "./unpriced-market";
import { normalizeOrderType } from "./order-type";
import { orderTypeAliasReason } from "./order-type-alias";
import { validateOnlyReason } from "./validate-only";
import { requestWindowReason } from "./request-window";
import { slippageReason } from "./slippage";
import { priceProtectReason } from "./price-protect";
import { priceMatchReason } from "./price-match";
import { categoryReason } from "./category";
import { strategyIdReason } from "./strategy-id";
import { gridIdReason } from "./grid-id";
import { attachAlgoReason } from "./attach-algo";
import { leverageModeReason } from "./leverage-mode";
import { targetCurrencyReason } from "./target-currency";
import { orderRemarkReason } from "./order-remark";
import { subAccountReason } from "./sub-account";
import { workingTypeReason } from "./working-type";
import { normalizeTimeInForce } from "./time-in-force";
import { tifAliasReason } from "./tif-alias";
import { icebergReason } from "./iceberg";
import { quoteSizeReason } from "./quote-size";
import { postOnlyReason } from "./post-only";
import { postOnlyAliasReason } from "./post-only-alias";
import { reduceOnlyReason } from "./reduce-only";
import { closePositionReason } from "./close-position";
import { stopPriceReason } from "./stop-price";
import { autoBorrowReason } from "./auto-borrow";
import { borrowSizeReason } from "./borrow-size";
import { repaySizeReason } from "./repay-size";
import { settleCurrencyReason } from "./settle-currency";
import { trailingReason } from "./trailing";
import { orderExpiryReason } from "./order-expiry";
import { selfTradeReason } from "./self-trade";
import { stpModeReason } from "./stp-mode";
import { execInstReason } from "./exec-inst";
import { mmpReason } from "./mmp";
import { positionSideReason } from "./position-side";
import { positionIndexReason } from "./position-index";
import { openOffsetReason } from "./open-offset";
import { tradeSideReason } from "./trade-side";
import { isolatedReason } from "./isolated";
import { baseSizeReason } from "./base-size";
import { priceAliasReason } from "./price-alias";
import { clientIdAliasReason } from "./client-id-alias";
import { cancelReplaceReason } from "./cancel-replace";
import { sideAliasReason } from "./side-alias";
import { orderListReason } from "./order-list";
import { symbolAliasReason } from "./symbol-alias";
import { accountRouteReason } from "./account-route";
import { credentialBodyReason } from "./credential-body";
import { spotOnlyReason } from "./spot-only";
import { sideEffectReason } from "./side-effect";
import { feeCurrencyReason } from "./fee-currency";
import { brokerAttributionReason } from "./broker-attribution";
import { orderLinkReason } from "./order-link";
import { normalizeOrderSide } from "./side-form";
import { normalizePairSymbol } from "./symbol-form";
import { symbolFlipCooldownReason } from "./symbol-flip";
import {
  workingNotionalPerSymbolReason,
  workingNotionalReason,
  workingNotionalUsd,
  workingNotionalUsdForSymbol,
} from "./working-notional";

export type OrderIntent = {
  symbol: string;
  side: Side;
  amount: number;
  type?: "market" | "limit";
  price?: number;
  /** Mark used to band limits and to size a market that has no price. */
  markPrice?: number;
  quotedAt?: number;
  clientOrderId?: string;
  reason?: string;
  /** Resting policy. Omitted means GTC. IOC/FOK are refused before the adapter. */
  timeInForce?: string;
  /** Time-in-force alias. Adapters read timeInForce only, so a present value is refused. */
  tif?: string;
  /** Time-in-force alias. Adapters read timeInForce only, so a present value is refused. */
  time_in_force?: string;
  /** Immediate-or-cancel flag. Adapters do not forward it, so a present value is refused. */
  immediateOrCancel?: boolean | string | number;
  /** Fill-or-kill flag. Adapters do not forward it, so a present value is refused. */
  fillOrKill?: boolean | string | number;
  /** Maker-only flag. Adapters do not forward it, so true is refused. */
  postOnly?: boolean;
  /** Maker-only alias. Adapters read postOnly only, so a present value is refused. */
  post_only?: boolean | string | number;
  /** Maker-only alias. Adapters do not forward it, so a present value is refused. */
  makerOnly?: boolean | string | number;
  /** Maker-only alias. Adapters do not forward it, so a present value is refused. */
  timeInForcePostOnly?: boolean | string | number;
  /** Close-only flag. Adapters do not forward it, so true is refused. */
  reduceOnly?: boolean;
  /** Trigger price. Adapters do not forward it, so a present value is refused. */
  stopPrice?: number;
  /** Display-size flag. Adapters do not forward it, so true is refused. */
  iceberg?: boolean;
  /** Hide-size flag. Adapters do not forward it, so true is refused. */
  hidden?: boolean;
  /** Shown slice. Adapters do not forward it, so a present value is refused. */
  visibleSize?: number;
  /** Display-size alias. Adapters do not forward it, so a present value is refused. */
  icebergQty?: number | string;
  /** Display-size alias. Adapters do not forward it, so a present value is refused. */
  displayQty?: number | string;
  /** Hidden-size alias. Adapters do not forward it, so a present value is refused. */
  hiddenSize?: number | string;
  /** Display-size alias. Adapters do not forward it, so a present value is refused. */
  displaySize?: number | string;
  /** Shown-slice alias. Adapters do not forward it, so a present value is refused. */
  visibleQty?: number | string;
  /** Iceberg-size alias. Adapters do not forward it, so a present value is refused. */
  icebergSize?: number | string;
  /** Quote spend. Adapters size by base amount, so a present value is refused. */
  funds?: number;
  /** Quote spend. Adapters size by base amount, so a present value is refused. */
  quoteOrderQty?: number;
  /** Quote spend. Adapters size by base amount, so a present value is refused. */
  quoteQty?: number;
  /** Margin auto-borrow. Spot adapters do not forward it, so true is refused. */
  autoBorrow?: boolean;
  /** Margin auto-repay. Spot adapters do not forward it, so true is refused. */
  autoRepay?: boolean;
  /** Margin borrow size. Adapters size by base amount and do not borrow, so a present value is refused. */
  borrowAmount?: number | string | boolean;
  /** Margin borrow-size alias. Adapters do not borrow, so a present value is refused. */
  borrowSize?: number | string | boolean;
  /** Loan amount. Adapters do not borrow, so a present value is refused. */
  loanAmount?: number | string | boolean;
  /** Margin repay size. Adapters size by base amount and do not repay, so a present value is refused. */
  repayAmount?: number | string | boolean;
  /** Margin repay-size alias. Adapters do not repay, so a present value is refused. */
  repaySize?: number | string | boolean;
  /** Debt amount. Adapters do not repay, so a present value is refused. */
  debtAmount?: number | string | boolean;
  /** Settlement currency. Adapters do not set it, so a present value is refused. */
  settleCcy?: string | number | boolean;
  /** Settlement coin alias. Adapters do not set it, so a present value is refused. */
  settleCoin?: string | number | boolean;
  /** Quote coin. Adapters do not set a settlement asset, so a present value is refused. */
  quoteCoin?: string | number | boolean;
  /** Extra trigger. Adapters do not forward it, so a present value is refused. */
  triggerPrice?: number;
  /** Stop-loss price. Adapters do not forward it, so a present value is refused. */
  stopLossPrice?: number;
  /** Take-profit price. Adapters do not forward it, so a present value is refused. */
  takeProfitPrice?: number;
  /** Trailing offset. Adapters do not forward it, so a present value is refused. */
  trailingDelta?: number;
  /** Trailing percent. Adapters do not forward it, so a present value is refused. */
  trailingPercent?: number;
  /** Callback rate. Adapters do not forward it, so a present value is refused. */
  callbackRate?: number;
  /** Activation price. Adapters do not forward it, so a present value is refused. */
  activationPrice?: number;
  /** Seconds until cancel. Adapters do not forward it, so a present value is refused. */
  cancelAfter?: number;
  /** Absolute expire time. Adapters do not forward it, so a present value is refused. */
  expireTime?: number;
  /** Good-till date. Adapters do not forward it, so a present value is refused. */
  goodTillDate?: number | string;
  /** KuCoin STP. Adapters do not forward it, so a present value is refused. */
  stp?: string;
  /** Self-trade prevention. Adapters do not forward it, so a present value is refused. */
  selfTradePrevention?: string;
  /** Self-trade prevention mode. Adapters do not forward it, so a present value is refused. */
  selfTradePreventionMode?: string;
  /** OKX STP mode. Adapters do not forward it, so a present value is refused. */
  stpMode?: string | number | boolean;
  /** Binance SMP type. Adapters do not forward it, so a present value is refused. */
  smpType?: string | number | boolean;
  /** Prevent-self-trade flag. Adapters do not forward it, so a present value is refused. */
  preventSelfTrade?: string | number | boolean;
  /** Bybit execution instruction. Adapters do not forward it, so a present value is refused. */
  execInst?: string | number | boolean;
  /** Execution-instruction alias. Adapters do not forward it, so a present value is refused. */
  execInstruction?: string | number | boolean;
  /** Instruction alias. Adapters do not forward it, so a present value is refused. */
  instruction?: string | number | boolean;
  /** Market-maker protection. Adapters do not forward it, so a present value is refused. */
  mmp?: string | number | boolean;
  /** MMP group. Adapters do not forward it, so a present value is refused. */
  mmpGroup?: string | number | boolean;
  /** Market-maker protection alias. Adapters do not forward it, so a present value is refused. */
  marketMakerProtection?: string | number | boolean;
  /** Futures position side. Spot adapters do not forward it, so a present value is refused. */
  positionSide?: string;
  /** Hedge mode. Spot adapters do not forward it, so a present value is refused. */
  hedgeMode?: string | boolean;
  /** Position mode. Spot adapters do not forward it, so a present value is refused. */
  positionMode?: string;
  /** Hedge position index. Spot adapters do not forward it, so a present value is refused. */
  positionIdx?: number | string | boolean;
  /** OKX position side. Spot adapters do not forward it, so a present value is refused. */
  posSide?: string | number | boolean;
  /** Position-index alias. Spot adapters do not forward it, so a present value is refused. */
  positionIndex?: number | string | boolean;
  /** Open or close offset. Spot adapters do not forward it, so a present value is refused. */
  openClose?: string | number | boolean;
  /** Position-offset alias. Spot adapters do not forward it, so a present value is refused. */
  posOffset?: string | number | boolean;
  /** Close fraction. Adapters size by base amount, so a present value is refused. */
  closeFraction?: number | string | boolean;
  /** Futures trade side. Spot adapters do not forward it, so a present value is refused. */
  tradeSide?: string | number | boolean;
  /** Futures hold side. Spot adapters do not forward it, so a present value is refused. */
  holdSide?: string | number | boolean;
  /** Futures open type. Spot adapters do not forward it, so a present value is refused. */
  openType?: string | number | boolean;
  /** Isolated margin. Spot adapters do not forward it, so a present value is refused. */
  isolated?: string | boolean;
  /** Isolated flag. Spot adapters do not forward it, so a present value is refused. */
  isIsolated?: string | boolean;
  /** Close entire position. Spot adapters do not forward it, so a present value is refused. */
  closePosition?: boolean | number | string;
  /** Close-on-trigger. Adapters do not forward it, so a present value is refused. */
  closeOnTrigger?: boolean | number | string;
  /** Close-order flag. Adapters place a normal order, so a present value is refused. */
  closeOrder?: boolean | number | string;
  /** Size alias. Adapters size by amount, so a present value is refused. */
  size?: number | string;
  /** Size alias. Adapters size by amount, so a present value is refused. */
  quantity?: number | string;
  /** Size alias. Adapters size by amount, so a present value is refused. */
  qty?: number | string;
  /** Size alias. Adapters size by amount, so a present value is refused. */
  baseSize?: number | string;
  /** Price alias. Adapters price by price, so a present value is refused. */
  limitPrice?: number | string;
  /** Price alias. Adapters price by price, so a present value is refused. */
  orderPrice?: number | string;
  /** Price alias. Adapters price by price, so a present value is refused. */
  px?: number | string;
  /** KuCoin client oid. Adapters identify by clientOrderId, so a present value is refused. */
  clientOid?: string;
  /** Binance client-id alias. Adapters identify by clientOrderId, so a present value is refused. */
  newClientOrderId?: string;
  /** Cancel-replace id. Adapters do not forward it, so a present value is refused. */
  origClientOrderId?: string;
  /** Cancel-replace flag. Adapters place a new order and do not cancel, so a present value is refused. */
  cancelReplace?: boolean | string | number;
  /** Resting id to cancel. Adapters do not cancel it, so a present value is refused. */
  cancelOrderId?: string | number;
  /** Resting id to cancel. Adapters do not cancel it, so a present value is refused. */
  orderIdToCancel?: string | number;
  /** Side alias. Adapters read side only, so a present value is refused. */
  orderSide?: string;
  /** Side alias. Adapters read side only, so a present value is refused. */
  direction?: string;
  /** Side alias. Adapters read side only, so a present value is refused. */
  action?: string;
  /** OCO flag. Adapters place one spot order, so a present value is refused. */
  oco?: boolean | string | number;
  /** Order-list id. Adapters place one spot order, so a present value is refused. */
  orderListId?: string | number;
  /** List client id. Adapters place one spot order, so a present value is refused. */
  listClientOrderId?: string;
  /** OCO above leg. Adapters do not forward it, so a present value is refused. */
  aboveType?: string;
  /** OCO below leg. Adapters do not forward it, so a present value is refused. */
  belowType?: string;
  /** Stop-limit price. Adapters do not forward it, so a present value is refused. */
  stopLimitPrice?: number | string;
  /** Pair alias. Adapters read symbol only, so a present value is refused. */
  pair?: string;
  /** Market alias. Adapters read symbol only, so a present value is refused. */
  market?: string;
  /** Instrument alias. Adapters read symbol only, so a present value is refused. */
  instrument?: string;
  /** Account-type alias. Adapters do not route an account, so a present value is refused. */
  accountType?: string;
  /** Account alias. Adapters do not route an account, so a present value is refused. */
  account?: string;
  /** Funds-account alias. Adapters do not route an account, so a present value is refused. */
  fundsAccount?: string;
  /** Client API key. Adapters authenticate from server env only, so a present value is refused. */
  apiKey?: string;
  /** Client secret. Adapters authenticate from server env only, so a present value is refused. */
  apiSecret?: string;
  /** Client secret alias. Adapters authenticate from server env only, so a present value is refused. */
  secret?: string;
  /** Client passphrase. Adapters authenticate from server env only, so a present value is refused. */
  passphrase?: string;
  /** Request signature. Adapters sign server-side, so a present value is refused. */
  signature?: string;
  /** Type alias. Adapters read type only, so a present value is refused. */
  ordType?: string;
  /** Type alias. Adapters read type only, so a present value is refused. */
  orderType?: string;
  /** Type alias. Adapters read type only, so a present value is refused. */
  order_type?: string;
  /** Client recv window. Adapters do not forward a deadline, so a present value is refused. */
  recvWindow?: number | string;
  /** ACK/FULL result shape. Adapters do not forward it, so a present value is refused. */
  newOrderRespType?: string;
  /** ACK/FULL result shape. Adapters do not forward it, so a present value is refused. */
  responseType?: string;
  /** Book-move cap. Adapters do not forward it, so a present value is refused. */
  maxSlippage?: number | string;
  /** Book-move cap. Adapters do not forward it, so a present value is refused. */
  slippage?: number | string;
  /** Book-move cap. Adapters do not forward it, so a present value is refused. */
  slippageTolerance?: number | string;
  /** Exchange price band. Adapters do not forward it, so a present value is refused. */
  priceProtect?: boolean | string | number;
  /** Exchange price band. Adapters do not forward it, so a present value is refused. */
  priceProtection?: boolean | string | number;
  /** Percent-price filter. Adapters do not forward it, so a present value is refused. */
  percentPrice?: number | string;
  /** Book-relative price match. Adapters do not forward it, so a present value is refused. */
  priceMatch?: string | number | boolean;
  /** Pegged price type. Adapters do not forward it, so a present value is refused. */
  pegPriceType?: string | number | boolean;
  /** Peg offset. Adapters do not forward it, so a present value is refused. */
  pegOffsetValue?: number | string | boolean;
  /** Product category. Adapters place spot only, so a non-spot value is refused. */
  category?: string | number | boolean;
  /** Product type. Adapters place spot only, so a non-spot value is refused. */
  productType?: string | number | boolean;
  /** Instrument type. Adapters place spot only, so a non-spot value is refused. */
  instType?: string | number | boolean;
  /** Grid flag. Adapters place one plain spot order, so true is refused. */
  grid?: boolean | string | number;
  /** Grid id. Adapters do not attach a grid, so a present value is refused. */
  gridId?: string | number | boolean;
  /** Algo id. Adapters do not attach a grid algo, so a present value is refused. */
  algoId?: string | number | boolean;
  /** Attached bracket. Adapters place one plain spot order, so a present value is refused. */
  attachAlgoOrds?: unknown;
  /** Take-profit trigger. Adapters do not attach a bracket, so a present value is refused. */
  tpTriggerPx?: string | number | boolean;
  /** Stop-loss trigger. Adapters do not attach a bracket, so a present value is refused. */
  slTriggerPx?: string | number | boolean;
  /** Leverage. Adapters place spot only, so a present value is refused. */
  leverage?: string | number | boolean;
  /** Margin mode. Adapters place spot only, so a present value is refused. */
  marginMode?: string | number | boolean;
  /** Trade mode. Adapters place spot only, so a present value is refused. */
  tdMode?: string | number | boolean;
  /** OKX size unit. Adapters size by base amount, so a present value is refused. */
  tgtCcy?: string | number | boolean;
  /** Size-unit alias. Adapters size by base amount, so a present value is refused. */
  targetCurrency?: string | number | boolean;
  /** Size-currency alias. Adapters size by base amount, so a present value is refused. */
  szCcy?: string | number | boolean;
  /** Client remark. Adapters do not forward a note, so a present value is refused. */
  remark?: string | number | boolean;
  /** Client tag. Adapters do not forward a note, so a present value is refused. */
  tag?: string | number | boolean;
  /** Client tag alias. Adapters do not forward a note, so a present value is refused. */
  clientTag?: string | number | boolean;
  /** Sub-account route. Adapters use the server key account, so a present value is refused. */
  subAccount?: string | number | boolean;
  /** Sub-account uid. Adapters use the server key account, so a present value is refused. */
  subUid?: string | number | boolean;
  /** Account uid. Adapters use the server key account, so a present value is refused. */
  uid?: string | number | boolean;
  /** KuCoin trade type. Adapters place spot only, so a non-spot value is refused. */
  tradeType?: string | number | boolean;
  /** Margin-trade flag. Adapters place spot only, so a present value is refused. */
  marginTrade?: string | number | boolean;
  /** Margin flag. Adapters place spot only, so true is refused. */
  isMargin?: string | number | boolean;
  /** Margin side-effect type. Adapters place spot only, so a present value is refused. */
  sideEffectType?: string | number | boolean;
  /** Margin side-effect alias. Adapters place spot only, so a present value is refused. */
  sideEffect?: string | number | boolean;
  /** Margin effect alias. Adapters place spot only, so a present value is refused. */
  marginEffect?: string | number | boolean;
  /** Fee asset. Adapters charge the default fee, so a present value is refused. */
  feeCurrency?: string | number | boolean;
  /** Fee-asset alias. Adapters charge the default fee, so a present value is refused. */
  feeCcy?: string | number | boolean;
  /** Deduct-fee flag. Adapters charge the default fee, so a present value is refused. */
  deductFee?: string | number | boolean;
  /** Broker id. Adapters do not attribute a partner, so a present value is refused. */
  brokerId?: string | number | boolean;
  /** Broker client id. Adapters do not attribute a partner, so a present value is refused. */
  brokerClientId?: string | number | boolean;
  /** Rebate flag. Adapters do not set a rebate, so a present value is refused. */
  rebate?: string | number | boolean;
  /** OKX client id. Adapters identify by clientOrderId, so a present value is refused. */
  clOrdId?: string | number | boolean;
  /** Bybit order link. Adapters identify by clientOrderId, so a present value is refused. */
  orderLinkId?: string | number | boolean;
  /** Link id. Adapters identify by clientOrderId, so a present value is refused. */
  linkId?: string | number | boolean;
  /** Algo strategy id. Adapters place one plain spot order, so a present value is refused. */
  strategyId?: string | number | boolean;
  /** Algo strategy type. Adapters place one plain spot order, so a present value is refused. */
  strategyType?: string | number | boolean;
  /** Mark or last trigger source. Adapters do not forward it, so a present value is refused. */
  workingType?: string | number | boolean;
  /** Stop trigger source. Adapters do not forward it, so a present value is refused. */
  stopWorkingType?: string | number | boolean;
  /** Trigger reference. Adapters do not forward it, so a present value is refused. */
  triggerBy?: string | number | boolean;
  /** Rehearsal flag. Adapters place a real spot order, so true is refused. */
  test?: boolean | string | number;
  /** Rehearsal flag. Adapters place a real spot order, so a present value is refused. */
  dryRun?: boolean | string | number;
  /** Rehearsal flag. Adapters place a real spot order, so a present value is refused. */
  validateOnly?: boolean | string | number;
};

export type SubmitResult =
  | { ok: true; order: UnifiedOrder; reason?: string }
  | { ok: false; reason: string; order?: UnifiedOrder };

export type PortfolioSnapshot = {
  cash: number;
  positions: Record<string, { amount: number; avgEntry: number }>;
};

export type OrderManagerOptions = {
  startingCash?: number;
  startingPositions?: Record<string, { amount: number; avgEntry: number }>;
  seenOrders?: UnifiedOrder[];
  lastSubmitAt?: number;
  onPortfolioChange?: (portfolio: PortfolioSnapshot) => void;
  onSeenOrdersChange?: (orders: UnifiedOrder[]) => void;
  onLastSubmitAtChange?: (at: number) => void;
};

const ALLOWED = new Set<string>(TRADING_CONFIG.pairs);

function isWorking(status: string): boolean {
  return status === "open" || status === "partially_filled" || status === "pending";
}

export class OrderManager {
  private cash: number;
  private positions: Record<string, { amount: number; avgEntry: number }>;
  private seen: UnifiedOrder[];
  private lastSubmitAt: number;
  private readonly onPortfolioChange?: OrderManagerOptions["onPortfolioChange"];
  private readonly onSeenOrdersChange?: OrderManagerOptions["onSeenOrdersChange"];
  private readonly onLastSubmitAtChange?: OrderManagerOptions["onLastSubmitAtChange"];

  constructor(
    private readonly adapter: ExchangeAdapter,
    options: OrderManagerOptions = {},
  ) {
    this.cash = options.startingCash ?? TRADING_CONFIG.paperStartingBalance;
    this.positions = { ...(options.startingPositions ?? {}) };
    this.seen = [...(options.seenOrders ?? [])];
    this.lastSubmitAt = options.lastSubmitAt ?? 0;
    this.onPortfolioChange = options.onPortfolioChange;
    this.onSeenOrdersChange = options.onSeenOrdersChange;
    this.onLastSubmitAtChange = options.onLastSubmitAtChange;
  }

  positionAmount(symbol: string): number {
    return this.positions[symbol]?.amount ?? 0;
  }

  snapshot(): PortfolioSnapshot {
    return { cash: this.cash, positions: { ...this.positions } };
  }

  seenOrders(): UnifiedOrder[] {
    return [...this.seen];
  }

  /**
   * Cancel resting working orders older than orders.staleOpenOrderMs.
   * Does not flatten positions. Adapter cancel failures are logged and skipped.
   */
  async cancelStaleOpenOrders(now = Date.now()): Promise<{ canceled: number; failed: number }> {
    const maxAge = TRADING_CONFIG.orders.staleOpenOrderMs;
    return this.cancelSelected(selectStaleOpenOrders(this.seen, now, maxAge));
  }

  /**
   * Cancel every working order (halt path). Does not flatten positions.
   */
  async cancelAllWorkingOrders(): Promise<{ canceled: number; failed: number }> {
    return this.cancelSelected(selectWorkingOrders(this.seen));
  }

  private async cancelSelected(
    selected: UnifiedOrder[],
  ): Promise<{ canceled: number; failed: number }> {
    let canceled = 0;
    let failed = 0;
    for (const order of selected) {
      try {
        await this.adapter.cancelOrder(order.id, order.symbol);
        this.remember({
          ...order,
          status: "canceled",
          remaining: order.remaining ?? Math.max(0, order.amount - (order.filled ?? 0)),
        });
        canceled += 1;
      } catch (err) {
        failed += 1;
        const msg = err instanceof Error ? err.message : String(err);
        console.info(`[orders] cancel failed ${order.id} ${order.symbol}: ${msg}`);
      }
    }
    return { canceled, failed };
  }

  async submit(intent: OrderIntent, riskState: RiskState): Promise<SubmitResult> {
    const now = Date.now();
    const cfg = TRADING_CONFIG.orders;

    const rehearsal = validateOnlyReason(intent.test, intent.dryRun, intent.validateOnly);
    if (rehearsal) return this.fail(rehearsal);

    const requestWindow = requestWindowReason(
      intent.recvWindow,
      intent.newOrderRespType,
      intent.responseType,
    );
    if (requestWindow) return this.fail(requestWindow);

    const slippage = slippageReason(
      intent.maxSlippage,
      intent.slippage,
      intent.slippageTolerance,
    );
    if (slippage) return this.fail(slippage);

    const priceProtect = priceProtectReason(
      intent.priceProtect,
      intent.priceProtection,
      intent.percentPrice,
    );
    if (priceProtect) return this.fail(priceProtect);

    const priceMatch = priceMatchReason(
      intent.priceMatch,
      intent.pegPriceType,
      intent.pegOffsetValue,
    );
    if (priceMatch) return this.fail(priceMatch);

    const category = categoryReason(intent.category, intent.productType, intent.instType);
    if (category) return this.fail(category);

    const gridId = gridIdReason(intent.grid, intent.gridId, intent.algoId);
    if (gridId) return this.fail(gridId);

    const attachAlgo = attachAlgoReason(
      intent.attachAlgoOrds,
      intent.tpTriggerPx,
      intent.slTriggerPx,
    );
    if (attachAlgo) return this.fail(attachAlgo);

    const targetCurrency = targetCurrencyReason(intent.tgtCcy, intent.targetCurrency, intent.szCcy);
    if (targetCurrency) return this.fail(targetCurrency);

    const leverageMode = leverageModeReason(intent.leverage, intent.marginMode, intent.tdMode);
    if (leverageMode) return this.fail(leverageMode);

    const remark = orderRemarkReason(intent.remark, intent.tag, intent.clientTag);
    if (remark) return this.fail(remark);

    const subAccount = subAccountReason(intent.subAccount, intent.subUid, intent.uid);
    if (subAccount) return this.fail(subAccount);

    const strategy = strategyIdReason(intent.strategyId, intent.strategyType);
    if (strategy) return this.fail(strategy);

    const workingType = workingTypeReason(
      intent.workingType,
      intent.stopWorkingType,
      intent.triggerBy,
    );
    if (workingType) return this.fail(workingType);

    const typeAlias = orderTypeAliasReason(intent.ordType, intent.orderType, intent.order_type);
    if (typeAlias) return this.fail(typeAlias);

    const typed = normalizeOrderType(intent.type);
    if ("reason" in typed) return this.fail(typed.reason);
    const type = typed.type;
    intent = { ...intent, type };

    const tifAlias = tifAliasReason(
      intent.tif,
      intent.time_in_force,
      intent.immediateOrCancel,
      intent.fillOrKill,
    );
    if (tifAlias) return this.fail(tifAlias);

    const tif = normalizeTimeInForce(intent.timeInForce);
    if ("reason" in tif) return this.fail(tif.reason);
    intent = { ...intent, timeInForce: tif.timeInForce };

    const postOnlyAlias = postOnlyAliasReason(
      intent.post_only,
      intent.makerOnly,
      intent.timeInForcePostOnly,
    );
    if (postOnlyAlias) return this.fail(postOnlyAlias);

    const postOnly = postOnlyReason(intent.postOnly);
    if (postOnly) return this.fail(postOnly);

    const reduceOnly = reduceOnlyReason(intent.reduceOnly);
    if (reduceOnly) return this.fail(reduceOnly);

    const closePosition = closePositionReason(
      intent.closePosition,
      intent.closeOnTrigger,
      intent.closeOrder,
    );
    if (closePosition) return this.fail(closePosition);

    const stopPrice = stopPriceReason(intent.stopPrice);
    if (stopPrice) return this.fail(stopPrice);

    const iceberg = icebergReason(
      intent.iceberg,
      intent.visibleSize,
      intent.icebergQty,
      intent.displayQty,
      intent.hiddenSize,
      intent.displaySize,
      intent.visibleQty,
      intent.icebergSize,
    );
    if (iceberg) return this.fail(iceberg);
    const hidden = icebergReason(intent.hidden);
    if (hidden) return this.fail(hidden);

    const funds = quoteSizeReason(intent.funds, "Funds");
    if (funds) return this.fail(funds);
    const quoteOrderQty = quoteSizeReason(intent.quoteOrderQty, "Quote order qty");
    if (quoteOrderQty) return this.fail(quoteOrderQty);
    const quoteQty = quoteSizeReason(intent.quoteQty, "Quote qty");
    if (quoteQty) return this.fail(quoteQty);

    const spotOnly = spotOnlyReason(intent.leverage, intent.marginMode, intent.tradeType, intent.marginTrade, intent.isMargin);
    if (spotOnly) return this.fail(spotOnly);

    const autoBorrow = autoBorrowReason(intent.autoBorrow, intent.autoRepay);
    if (autoBorrow) return this.fail(autoBorrow);

    const borrowSize = borrowSizeReason(intent.borrowAmount, intent.borrowSize, intent.loanAmount);
    if (borrowSize) return this.fail(borrowSize);

    const repaySize = repaySizeReason(intent.repayAmount, intent.repaySize, intent.debtAmount);
    if (repaySize) return this.fail(repaySize);

    const settleCurrency = settleCurrencyReason(intent.settleCcy, intent.settleCoin, intent.quoteCoin);
    if (settleCurrency) return this.fail(settleCurrency);

    const sideEffect = sideEffectReason(intent.sideEffectType, intent.sideEffect, intent.marginEffect);
    if (sideEffect) return this.fail(sideEffect);

    const feeCurrency = feeCurrencyReason(intent.feeCurrency, intent.feeCcy, intent.deductFee);
    if (feeCurrency) return this.fail(feeCurrency);

    const brokerAttribution = brokerAttributionReason(
      intent.brokerId,
      intent.brokerClientId,
      intent.rebate,
    );
    if (brokerAttribution) return this.fail(brokerAttribution);

    const orderLink = orderLinkReason(intent.clOrdId, intent.orderLinkId, intent.linkId);
    if (orderLink) return this.fail(orderLink);

    const trailing = trailingReason(
      intent.triggerPrice,
      intent.stopLossPrice,
      intent.takeProfitPrice,
      intent.trailingDelta,
      intent.trailingPercent,
      intent.callbackRate,
      intent.activationPrice,
    );
    if (trailing) return this.fail(trailing);

    const expiry = orderExpiryReason(intent.cancelAfter, intent.expireTime, intent.goodTillDate);
    if (expiry) return this.fail(expiry);

    const selfTrade = selfTradeReason(
      intent.stp,
      intent.selfTradePrevention,
      intent.selfTradePreventionMode,
    );
    if (selfTrade) return this.fail(selfTrade);

    const stpMode = stpModeReason(intent.stpMode, intent.smpType, intent.preventSelfTrade);
    if (stpMode) return this.fail(stpMode);

    const execInst = execInstReason(intent.execInst, intent.execInstruction, intent.instruction);
    if (execInst) return this.fail(execInst);

    const mmp = mmpReason(intent.mmp, intent.mmpGroup, intent.marketMakerProtection);
    if (mmp) return this.fail(mmp);

    const positionSide = positionSideReason(
      intent.positionSide,
      intent.hedgeMode,
      intent.positionMode,
    );
    if (positionSide) return this.fail(positionSide);

    const positionIndex = positionIndexReason(
      intent.positionIdx,
      intent.posSide,
      intent.positionIndex,
    );
    if (positionIndex) return this.fail(positionIndex);

    const openOffset = openOffsetReason(
      intent.openClose,
      intent.posOffset,
      intent.closeFraction,
    );
    if (openOffset) return this.fail(openOffset);

    const tradeSide = tradeSideReason(intent.tradeSide, intent.holdSide, intent.openType);
    if (tradeSide) return this.fail(tradeSide);

    const isolated = isolatedReason(intent.isolated, intent.isIsolated, intent.closePosition);
    if (isolated) return this.fail(isolated);

    const baseSize = baseSizeReason(intent.size, intent.quantity, intent.qty, intent.baseSize);
    if (baseSize) return this.fail(baseSize);

    const priceAlias = priceAliasReason(intent.limitPrice, intent.orderPrice, intent.px);
    if (priceAlias) return this.fail(priceAlias);

    const clientIdAlias = clientIdAliasReason(
      intent.clientOid,
      intent.newClientOrderId,
      intent.origClientOrderId,
    );
    if (clientIdAlias) return this.fail(clientIdAlias);

    const cancelReplace = cancelReplaceReason(
      intent.cancelReplace,
      intent.cancelOrderId,
      intent.orderIdToCancel,
    );
    if (cancelReplace) return this.fail(cancelReplace);

    const sideAlias = sideAliasReason(intent.orderSide, intent.direction, intent.action);
    if (sideAlias) return this.fail(sideAlias);

    const orderList = orderListReason(
      intent.oco,
      intent.orderListId,
      intent.listClientOrderId,
      intent.aboveType,
      intent.belowType,
      intent.stopLimitPrice,
    );
    if (orderList) return this.fail(orderList);

    const symbolAlias = symbolAliasReason(intent.pair, intent.market, intent.instrument);
    if (symbolAlias) return this.fail(symbolAlias);

    const accountRoute = accountRouteReason(intent.accountType, intent.account, intent.fundsAccount);
    if (accountRoute) return this.fail(accountRoute);

    const credentialBody = credentialBodyReason(
      intent.apiKey,
      intent.apiSecret,
      intent.secret,
      intent.passphrase,
      intent.signature,
    );
    if (credentialBody) return this.fail(credentialBody);

    applyHardStops(riskState);
    if (riskState.haltReason) {
      return this.fail(`Halted: ${riskState.haltReason}`);
    }

    const pair = normalizePairSymbol(intent.symbol, ALLOWED);
    if ("reason" in pair) return this.fail(pair.reason);
    intent = { ...intent, symbol: pair.symbol };

    const side = normalizeOrderSide(intent.side);
    if ("reason" in side) return this.fail(side.reason);
    intent = { ...intent, side: side.side };

    if (!(intent.amount > 0) || !Number.isFinite(intent.amount)) {
      return this.fail("Amount must be a positive finite number");
    }

    const fineAmount = excessAmountDecimalsReason(intent.amount, cfg.maxAmountDecimals);
    if (fineAmount) return this.fail(fineAmount);

    const finePrice = excessPriceDecimalsReason(type, intent.price, cfg.maxPriceDecimals);
    if (finePrice) return this.fail(finePrice);

    const badId = invalidClientOrderIdReason(intent.clientOrderId, cfg.maxClientOrderIdLength);
    if (badId) return this.fail(badId);

    const dup = duplicateClientOrderIdReason(intent.clientOrderId, this.seen);
    if (dup) return this.fail(dup);

    const stale = staleMarketQuoteReason(type, intent.quotedAt, now, cfg.maxPriceAgeMs);
    if (stale) return this.fail(stale);

    const band = limitPriceBandReason(
      type,
      intent.price,
      intent.markPrice,
      cfg.maxLimitDeviationPct,
    );
    if (band) return this.fail(band);

    const crossMark = crossMarkReason(
      type,
      intent.side,
      intent.symbol,
      intent.price,
      intent.markPrice,
      cfg.blockCrossMark,
    );
    if (crossMark) return this.fail(crossMark);

    const flip = symbolFlipCooldownReason(
      intent.symbol,
      intent.side,
      this.seen,
      now,
      cfg.symbolFlipCooldownMs,
    );
    if (flip) return this.fail(flip);

    const sameSide = sameSideCooldownReason(
      intent.symbol,
      intent.side,
      this.seen,
      now,
      cfg.sameSideCooldownMs,
    );
    if (sameSide) return this.fail(sameSide);

    const rejectBurst = rejectBurstReason(
      rejectedCountInWindow(this.seen, now, cfg.rejectBurstWindowMs),
      cfg.maxRejectsInWindow,
      cfg.rejectBurstWindowMs,
    );
    if (rejectBurst) return this.fail(rejectBurst);

    const rejectBurstSymbol = rejectBurstPerSymbolReason(
      intent.symbol,
      rejectedCountInWindowForSymbol(this.seen, intent.symbol, now, cfg.rejectBurstWindowMs),
      cfg.maxRejectsPerSymbolInWindow,
      cfg.rejectBurstWindowMs,
    );
    if (rejectBurstSymbol) return this.fail(rejectBurstSymbol);

    if (this.lastSubmitAt > 0 && now - this.lastSubmitAt < cfg.minSubmitIntervalMs) {
      return this.fail(
        `Burst cooldown: wait ${cfg.minSubmitIntervalMs - (now - this.lastSubmitAt)}ms`,
      );
    }

    const working = this.seen.filter((o) => isWorking(String(o.status)));
    if (working.length >= cfg.maxConcurrentOpenOrders) {
      return this.fail(
        `Working-order cap: ${working.length}/${cfg.maxConcurrentOpenOrders}`,
      );
    }
    const perSymbol = working.filter((o) => o.symbol === intent.symbol).length;
    if (perSymbol >= cfg.maxOpenOrdersPerSymbol) {
      return this.fail(
        `Per-symbol working-order cap: ${perSymbol}/${cfg.maxOpenOrdersPerSymbol} on ${intent.symbol}`,
      );
    }

    const cross = selfCrossReason(
      intent.side,
      intent.symbol,
      working,
      cfg.blockOppositeWorking,
    );
    if (cross) return this.fail(cross);

    const samePrice = samePriceWorkingReason(
      intent.side,
      intent.symbol,
      type === "limit" ? intent.price : undefined,
      working,
      cfg.samePriceBandPct,
      cfg.blockSamePriceWorking,
    );
    if (samePrice) return this.fail(samePrice);

    const rung = rungSpacingReason(
      intent.side,
      intent.symbol,
      type === "limit" ? intent.price : undefined,
      working,
      cfg.minRungSpacingPct,
      cfg.blockTightRung,
    );
    if (rung) return this.fail(rung);

    const slots = openSlotReason(
      intent.side,
      intent.symbol,
      openSlotSymbols(this.positions, working),
      TRADING_CONFIG.risk.maxOpenPositions,
    );
    if (slots) return this.fail(slots);

    const symbolDayTrades = acceptedTradeCountOnUtcDayForSymbol(this.seen, intent.symbol, now);
    const symbolTradeCap = dailyTradeCapPerSymbolReason(
      intent.symbol,
      symbolDayTrades,
      TRADING_CONFIG.risk.maxDailyTradesPerSymbol,
    );
    if (symbolTradeCap) return this.fail(symbolTradeCap);

    const buyLadder = consecutiveBuysReason(
      intent.side,
      intent.symbol,
      trailingAcceptedBuys(this.seen, intent.symbol),
      cfg.maxConsecutiveBuysPerSymbol,
    );
    if (buyLadder) return this.fail(buyLadder);

    const lossReentry = lossReentryReason(
      intent.side,
      intent.symbol,
      lastLosingSellAt(this.seen, intent.symbol, cfg.lossReentryMinLossPct),
      now,
      cfg.lossReentryCooldownMs,
    );
    if (lossReentry) return this.fail(lossReentry);

    const mark = intent.markPrice && intent.markPrice > 0 ? intent.markPrice : intent.price;
    const heldPos = this.positions[intent.symbol];
    const averageDown = averageDownReason(
      intent.side,
      intent.symbol,
      heldPos?.amount ?? 0,
      heldPos?.avgEntry ?? 0,
      mark,
      cfg.maxAverageDownPct,
    );
    if (averageDown) return this.fail(averageDown);

    const chaseUp = chaseUpReason(
      intent.side,
      intent.symbol,
      mark,
      lastAcceptedBuyFill(this.seen, intent.symbol),
      now,
      cfg.chaseUpWindowMs,
      cfg.maxChaseUpPct,
    );
    if (chaseUp) return this.fail(chaseUp);

    const unpriced = unpricedMarketReason(type, intent.price, intent.markPrice);
    if (unpriced) return this.fail(unpriced);

    const px = marketReferencePrice(type, intent.price, intent.markPrice);
    const notional = px != null ? intent.amount * px : undefined;
    if (px != null && notional != null) {
      if (notional > cfg.maxOrderNotionalUsd) {
        return this.fail(
          `Notional ${notional.toFixed(2)} exceeds max ${cfg.maxOrderNotionalUsd}`,
        );
      }
      if (notional < cfg.minOrderNotionalUsd) {
        return this.fail(
          `Notional ${notional.toFixed(2)} below min ${cfg.minOrderNotionalUsd}`,
        );
      }
      if (intent.side === "buy") {
        const booked = Object.values(this.positions).reduce(
          (sum, p) => sum + p.amount * p.avgEntry,
          0,
        );
        if (booked + notional > cfg.maxGrossExposureUsd) {
          return this.fail(
            `Gross exposure ${(booked + notional).toFixed(2)} exceeds max ${cfg.maxGrossExposureUsd}`,
          );
        }
        const held = this.positionAmount(intent.symbol);
        const nextCost = held * (this.positions[intent.symbol]?.avgEntry ?? px) + notional;
        const maxByPct = riskState.portfolioValue * TRADING_CONFIG.risk.maxPositionPct;
        if (riskState.portfolioValue > 0 && nextCost > maxByPct) {
          return this.fail(
            `maxPositionPct: ${intent.symbol} would be ${nextCost.toFixed(2)} > ${maxByPct.toFixed(2)}`,
          );
        }
      }
    }

    const sleeve = workingNotionalReason(
      workingNotionalUsd(working),
      notional,
      cfg.maxWorkingNotionalUsd,
    );
    if (sleeve) return this.fail(sleeve);

    const sleeveSymbol = workingNotionalPerSymbolReason(
      intent.symbol,
      workingNotionalUsdForSymbol(working, intent.symbol),
      notional,
      cfg.maxWorkingNotionalPerSymbolUsd,
    );
    if (sleeveSymbol) return this.fail(sleeveSymbol);

    const dailyBuy = dailyBuyNotionalReason(
      intent.side,
      notional,
      acceptedBuyNotionalOnUtcDay(this.seen, now),
      cfg.maxDailyBuyNotionalUsd,
    );
    if (dailyBuy) return this.fail(dailyBuy);

    const dailyBuySymbol = dailyBuyNotionalPerSymbolReason(
      intent.side,
      intent.symbol,
      notional,
      acceptedBuyNotionalOnUtcDayForSymbol(this.seen, intent.symbol, now),
      cfg.maxDailyBuyNotionalPerSymbolUsd,
    );
    if (dailyBuySymbol) return this.fail(dailyBuySymbol);

    const hourlyBuy = hourlyBuyNotionalReason(
      intent.side,
      notional,
      acceptedBuyNotionalInWindow(this.seen, now, cfg.hourlyBuyWindowMs),
      cfg.maxHourlyBuyNotionalUsd,
    );
    if (hourlyBuy) return this.fail(hourlyBuy);

    const hourlyBuySymbol = hourlyBuyNotionalPerSymbolReason(
      intent.side,
      intent.symbol,
      notional,
      acceptedBuyNotionalInWindowForSymbol(this.seen, intent.symbol, now, cfg.hourlyBuyWindowMs),
      cfg.maxHourlyBuyNotionalPerSymbolUsd,
    );
    if (hourlyBuySymbol) return this.fail(hourlyBuySymbol);

    const dailySell = dailySellNotionalReason(
      intent.side,
      notional,
      acceptedSellNotionalOnUtcDay(this.seen, now),
      cfg.maxDailySellNotionalUsd,
    );
    if (dailySell) return this.fail(dailySell);

    const dailySellSymbol = dailySellNotionalPerSymbolReason(
      intent.side,
      intent.symbol,
      notional,
      acceptedSellNotionalOnUtcDayForSymbol(this.seen, intent.symbol, now),
      cfg.maxDailySellNotionalPerSymbolUsd,
    );
    if (dailySellSymbol) return this.fail(dailySellSymbol);

    const hourlySell = hourlySellNotionalReason(
      intent.side,
      notional,
      acceptedSellNotionalInWindow(this.seen, now, cfg.hourlySellWindowMs),
      cfg.maxHourlySellNotionalUsd,
    );
    if (hourlySell) return this.fail(hourlySell);

    const hourlySellSymbol = hourlySellNotionalPerSymbolReason(
      intent.side,
      intent.symbol,
      notional,
      acceptedSellNotionalInWindowForSymbol(this.seen, intent.symbol, now, cfg.hourlySellWindowMs),
      cfg.maxHourlySellNotionalPerSymbolUsd,
    );
    if (hourlySellSymbol) return this.fail(hourlySellSymbol);

    const reserveReason = cashReserveBuyReason(
      intent.side,
      this.cash,
      notional,
      TRADING_CONFIG.risk.minCashReserveUsd,
      workingBuyReservedUsd(working),
    );
    if (reserveReason) return this.fail(reserveReason);

    if (intent.side === "sell") {
      const held = this.positionAmount(intent.symbol);
      const reservedSells = workingSellReservedAmount(intent.symbol, working);
      const inventoryReason = inventoryReserveSellReason(
        intent.side,
        held,
        intent.amount,
        reservedSells,
        intent.symbol,
      );
      if (inventoryReason) return this.fail(inventoryReason);
      const available = held - reservedSells;
      const dust = sellDustRemainderReason(
        intent.side,
        available,
        intent.amount,
        px,
        cfg.minOrderNotionalUsd,
      );
      if (dust) return this.fail(dust);
    }

    const risk = evaluateRisk(riskState, intent.side, intent.symbol);
    if (!risk.allowed) {
      return this.fail(risk.reason);
    }

    let order: UnifiedOrder;
    try {
      if (type === "limit") {
        if (!(intent.price && intent.price > 0)) {
          return this.fail("Limit submit requires a positive price");
        }
        order = await this.adapter.placeLimitOrder(
          intent.symbol,
          intent.side,
          intent.amount,
          intent.price,
          intent.clientOrderId,
        );
      } else {
        order = await this.adapter.placeMarketOrder(
          intent.symbol,
          intent.side,
          intent.amount,
          intent.clientOrderId,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.fail(`Adapter error: ${msg}`);
    }

    this.remember(order);
    this.lastSubmitAt = now;
    this.onLastSubmitAtChange?.(now);

    if (order.status === "rejected") {
      return { ok: false, reason: order.rejectReason ?? "Rejected by adapter", order };
    }

    this.applyFill(order);
    return { ok: true, order };
  }

  private fail(reason: string): SubmitResult {
    return { ok: false, reason };
  }

  private remember(order: UnifiedOrder): void {
    const idx = this.seen.findIndex((o) => o.id === order.id);
    if (idx >= 0) this.seen[idx] = order;
    else this.seen.push(order);
    if (this.seen.length > 200) this.seen = this.seen.slice(-200);
    this.onSeenOrdersChange?.(this.seenOrders());
  }

  private applyFill(order: UnifiedOrder): void {
    const filled = order.filled ?? 0;
    if (filled <= 0) return;
    const px = order.price && order.price > 0 ? order.price : 0;
    const cost = order.cost > 0 ? order.cost : filled * px;

    if (order.side === "buy") {
      this.cash = Math.max(0, this.cash - cost);
      const existing = this.positions[order.symbol];
      if (existing) {
        const total = existing.amount + filled;
        const basis = existing.amount * existing.avgEntry + cost;
        this.positions[order.symbol] = {
          amount: total,
          avgEntry: total > 0 ? basis / total : existing.avgEntry,
        };
      } else {
        this.positions[order.symbol] = { amount: filled, avgEntry: px };
      }
    } else {
      this.cash += cost;
      const existing = this.positions[order.symbol];
      if (existing) {
        existing.amount -= filled;
        if (existing.amount <= 1e-8) delete this.positions[order.symbol];
      }
    }
    this.onPortfolioChange?.(this.snapshot());
  }
}
