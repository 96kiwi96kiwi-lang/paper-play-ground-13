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
import { crossMarginReason } from "./cross-margin";
import { isLeverageReason } from "./is-leverage";
import { isMarginReason } from "./is-margin";
import { marginAssetReason } from "./margin-asset";
import { quickMarginReason } from "./quick-margin";
import { triggerDirectionReason } from "./trigger-direction";
import { responseTypeReason } from "./response-type";
import { tpslOrderTypeReason } from "./tpsl-order-type";
import { tpslOrderPriceReason } from "./tpsl-order-price";
import { tpslTriggerPriceReason } from "./tpsl-trigger-price";
import { tpslTriggerByReason } from "./tpsl-trigger-by";
import { targetCurrencyReason } from "./target-currency";
import { orderRemarkReason } from "./order-remark";
import { subAccountReason } from "./sub-account";
import { workingTypeReason } from "./working-type";
import { normalizeTimeInForce } from "./time-in-force";
import { tifAliasReason } from "./tif-alias";
import { orderForceReason } from "./order-force";
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
import { goodTillTimeReason } from "./good-till-time";
import { selfTradeReason } from "./self-trade";
import { stpModeReason } from "./stp-mode";
import { execInstReason } from "./exec-inst";
import { mmpReason } from "./mmp";
import { bboReason } from "./bbo";
import { cancelOnDisconnectReason } from "./cancel-on-disconnect";
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
  /** Bitget order force. Adapters read timeInForce only, so a present value is refused. */
  force?: string | number | boolean;
  /** Order-force alias. Adapters read timeInForce only, so a present value is refused. */
  forceType?: string | number | boolean;
  /** Order-force alias. Adapters read timeInForce only, so a present value is refused. */
  orderForce?: string | number | boolean;
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
  /** Binance good-till time. Adapters do not forward it, so a present value is refused. */
  goodTillTime?: number | string | boolean;
  /** GTD alias. Adapters do not expire the order, so a present value is refused. */
  gtd?: number | string | boolean;
  /** Expire-at alias. Adapters do not forward it, so a present value is refused. */
  expireAt?: number | string | boolean;
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
  /** Best bid/offer price. Adapters price by price or market, so a present value is refused. */
  bbo?: string | number | boolean;
  /** Best-bid-offer alias. Adapters do not queue at the book, so a present value is refused. */
  bestBidOffer?: string | number | boolean;
  /** Book-price alias. Adapters do not queue at the book, so a present value is refused. */
  bookPrice?: string | number | boolean;
  /** Cancel on disconnect. Adapters do not arm it, so a present value is refused. */
  cancelOnDisconnect?: string | number | boolean;
  /** Dead-man switch. Adapters do not arm it, so a present value is refused. */
  deadman?: string | number | boolean;
  /** COD flag. Adapters do not arm it, so a present value is refused. */
  cod?: string | number | boolean;
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
  clien