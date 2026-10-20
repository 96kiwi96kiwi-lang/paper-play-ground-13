/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
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
import { orderSourceReason } from "./order-source";
import { orderChannelReason } from "./order-channel";
import { orderLabelReason } from "./order-label";
import { orderCommentReason } from "./order-comment";
import { orderMemoReason } from "./order-memo";
import { orderGroupReason } from "./order-group";
import { orderNoteReason } from "./order-note";
import { orderPriorityReason } from "./order-priority";
import { subAccountReason } from "./sub-account";
import { workingTypeReason } from "./working-type";
import { normalizeTimeInForce } from "./time-in-force";
import { tifAliasReason } from "./tif-alias";
import { orderForceReason } from "./order-force";
import { icebergReason } from "./iceberg";
import { quoteQtyReason } from "./quote-qty";
import { fundsReason } from "./funds";
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
import { amountAliasReason } from "./amount-alias";
import { sizeAliasReason } from "./size-alias";
import { contractsAliasReason } from "./contracts-alias";
import { piecesAliasReason } from "./pieces-alias";
import { szAliasReason } from "./sz-alias";
import { positionsAliasReason } from "./positions-alias";
import { portfolioAliasReason } from "./portfolio-alias";
import { equityAliasReason } from "./equity-alias";
import { navAliasReason } from "./nav-alias";
import { assetsAliasReason } from "./assets-alias";
import { holdingsAliasReason } from "./holdings-alias";
import { valueAliasReason } from "./value-alias";
import { costAliasReason } from "./cost-alias";
import { notionalAliasReason } from "./notional-alias";
import { exposureAliasReason } from "./exposure-alias";
import { riskAliasReason } from "./risk-alias";
import { totalAliasReason } from "./total-alias";
import { sumAliasReason } from "./sum-alias";
import { volumeAliasReason } from "./volume-alias";
import { baseQtyAliasReason } from "./base-qty-alias";
import { unitsAliasReason } from "./units-alias";
import { countAliasReason } from "./count-alias";
import { quantityAliasReason } from "./quantity-alias";
import { sharesAliasReason } from "./shares-alias";
import { lotsAliasReason } from "./lots-alias";
import { priceAliasReason } from "./price-alias";
import { clientIdAliasReason } from "./client-id-alias";
import { cancelReplaceReason } from "./cancel-replace";
import { sideAliasReason } from "./side-alias";
import { orderListReason } from "./order-list";
import { positionIdxReason } from "./position-idx";
import { orderTagReason } from "./order-tag";
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
  /** Unsupported order alias; rejected before the adapter. */
  positions?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  orderPositions?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  basePositions?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  portfolio?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  orderPortfolio?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  basePortfolio?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  equity?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  orderEquity?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  baseEquity?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  nav?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  orderNav?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  baseNav?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  assets?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  orderAssets?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  baseAssets?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  holdings?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  orderHoldings?: unknown;
  /** Unsupported order alias; rejected before the adapter. */
  baseHoldings?: unknown;
  /** Resting policy. Omitted means GTC. IOC/FOK are refused before the adapter. */
  timeInForce?: string;
  /** Time-in-force alias. Adapters read timeInForce only, so a present value is refused. */
  tif?: string;
  /** Time-in-force alias used by some exchange APIs. */
  orderTif?: unknown;
  /** Time-in-force alias. Adapters read timeInForce only, so a present value is refused. */
  time_in_force?: string;
  /** Time-in-force alias. Adapters read timeInForce only, so a present value is refused. */
  timeInForceAlias?: string;
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
  /** Maker-only alias. Adapters do not forward it, so a present value is refused. */
  postOnlyFlag?: boolean | string | number;
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
  /** Quote-spend alias. Adapters size by base amount, so a present value is refused. */
  quoteFunds?: unknown;
  /** Quote-spend alias. Adapters size by base amount, so a present value is refused. */
  fundsAmount?: unknown;
  /** Quote spend. Adapters size by base amount, so a present value is refused. */
  quoteOrderQty?: number;
  /** Quote spend. Adapters size by base amount, so a present value is refused. */
  quoteQty?: number;
  /** Quote-notional alias. Adapters size by base amount, so a present value is refused. */
  notional?: unknown;
  /** Exposure alias. Adapters place by amount only, so a present value is refused. */
  exposure?: unknown;
  /** Order exposure alias. Adapters place by amount only, so a present value is refused. */
  orderExposure?: unknown;
  /** Base exposure alias. Adapters place by amount only, so a present value is refused. */
  baseExposure?: unknown;
  /** Risk alias. Adapters place by amount only, so a present value is refused. */
  risk?: unknown;
  /** Order risk alias. Adapters place by amount only, so a present value is refused. */
  orderRisk?: unknown;
  /** Base risk alias. Adapters place by amount only, so a present value is refused. */
  baseRisk?: unknown;
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
  /** Stop-price alias. Adapters do not forward it, so a present value is refused. */
  stopPx?: unknown;
  /** Stop-loss price. Adapters do not forward it, so a present value is refused. */
  stopLossPrice?: number;
  /** Take-profit price. Adapters do not forward it, so a present value is refused. */
  takeProfitPrice?: number;
  /** Trailing offset. Adapters do not forward it, so a present value is refused. */
  trailingDelta?: number;
  /** Trailing-stop flag/offset. Adapters do not forward it, so a present value is refused. */
  trailingStop?: unknown;
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
  stp?: string | number | boolean;
  /** Self-trade prevention mode. Adapters do not forward it, so a present value is refused. */
  stpMode?: string | number | boolean;
  /** Execution instruction. Adapters do not forward it, so a present value is refused. */
  execInst?: string | number | boolean;
  /** Market maker protection. Adapters do not forward it, so a present value is refused. */
  mmp?: boolean | string | number;
  /** Best bid offer. Adapters do not forward it, so a present value is refused. */
  bbo?: boolean | string | number;
  /** Cancel on disconnect. Adapters do not forward it, so a present value is refused. */
  cancelOnDisconnect?: boolean | string | number;
  /** Position side. Adapters do not forward it, so a present value is refused. */
  positionSide?: string | number | boolean;
  /** Position index. Adapters do not forward it, so a present value is refused. */
  positionIdx?: number | string | boolean;
  /** Open offset. Adapters do not forward it, so a present value is refused. */
  openOffset?: number | string | boolean;
  /** Trade side. Adapters do not forward it, so a present value is refused. */
  tradeSide?: string | number | boolean;
  /** Isolated margin. Adapters do not forward it, so a present value is refused. */
  isolated?: boolean | string | number;
  /** Base size. Adapters size by amount, so a present value is refused. */
  size?: number | string;
  /** Base quantity. Adapters size by amount, so a present value is refused. */
  quantity?: number | string;
  /** Qty alias. Adapters size by amount, so a present value is refused. */
  qty?: number | string;
  /** Base size alias. Adapters size by amount, so a present value is refused. */
  baseSize?: number | string;
  /** Amount alias. Adapters size by amount, so a present value is refused. */
  amountAlias?: unknown;
  /** Size alias. Adapters size by amount, so a present value is refused. */
  sizeAlias?: unknown;
  /** Contracts alias. Adapters size by amount, so a present value is refused. */
  contracts?: unknown;
  /** Order contracts alias. Adapters size by amount, so a present value is refused. */
  orderContracts?: unknown;
  /** Base contracts alias. Adapters size by amount, so a present value is refused. */
  baseContracts?: unknown;
  /** Pieces alias. Adapters size by amount, so a present value is refused. */
  pieces?: unknown;
  /** Order pieces alias. Adapters size by amount, so a present value is refused. */
  orderPieces?: unknown;
  /** Base pieces alias. Adapters size by amount, so a present value is refused. */
  basePieces?: unknown;
  /** Sz alias. Adapters size by amount, so a present value is refused. */
  sz?: unknown;
  /** Order sz alias. Adapters size by amount, so a present value is refused. */
  orderSz?: unknown;
  /** Sz value alias. Adapters size by amount, so a present value is refused. */
  szValue?: unknown;
  /** Value alias. Adapters size by amount, so a present value is refused. */
  value?: unknown;
  /** Order value alias. Adapters size by amount, so a present value is refused. */
  orderValue?: unknown;
  /** Base value alias. Adapters size by amount, so a present value is refused. */
  baseValue?: unknown;
  /** Cost alias. Adapters size by amount, so a present value is refused. */
  cost?: unknown;
  /** Order cost alias. Adapters size by amount, so a present value is refused. */
  orderCost?: unknown;
  /** Base cost alias. Adapters size by amount, so a present value is refused. */
  baseCost?: unknown;
  /** Order notional alias. Adapters size by amount, so a present value is refused. */
  orderNotional?: unknown;
  /** Base notional alias. Adapters size by amount, so a present value is refused. */
  baseNotional?: unknown;
  /** Total alias. Adapters size by amount, so a present value is refused. */
  total?: unknown;
  /** Order total alias. Adapters size by amount, so a present value is refused. */
  orderTotal?: unknown;
  /** Base total alias. Adapters size by amount, so a present value is refused. */
  baseTotal?: unknown;
  /** Sum alias. Adapters size by amount, so a present value is refused. */
  sum?: unknown;
  /** Order sum alias. Adapters size by amount, so a present value is refused. */
  orderSum?: unknown;
  /** Base sum alias. Adapters size by amount, so a present value is refused. */
  baseSum?: unknown;
  /** Volume alias. Adapters size by amount, so a present value is refused. */
  volume?: unknown;
  /** Order volume alias. Adapters size by amount, so a present value is refused. */
  orderVolume?: unknown;
  /** Base volume alias. Adapters size by amount, so a present value is refused. */
  baseVolume?: unknown;
  /** Base qty alias. Adapters size by amount, so a present value is refused. */
  baseQty?: unknown;
  /** Order base qty alias. Adapters size by amount, so a present value is refused. */
  orderBaseQty?: unknown;
  /** Base base qty alias. Adapters size by amount, so a present value is refused. */
  baseBaseQty?: unknown;
  /** Units alias. Adapters size by amount, so a present value is refused. */
  units?: unknown;
  /** Order units alias. Adapters size by amount, so a present value is refused. */
  orderUnits?: unknown;
  /** Base units alias. Adapters size by amount, so a present value is refused. */
  baseUnits?: unknown;
  /** Count alias. Adapters size by amount, so a present value is refused. */
  count?: unknown;
  /** Order count alias. Adapters size by amount, so a present value is refused. */
  orderCount?: unknown;
  /** Base count alias. Adapters size by amount, so a present value is refused. */
  baseCount?: unknown;
  /** Order quantity alias. Adapters size by amount, so a present value is refused. */
  orderQuantity?: unknown;
  /** Base quantity alias. Adapters size by amount, so a present value is refused. */
  baseQuantity?: unknown;
  /** Shares alias. Adapters size by amount, so a present value is refused. */
  shares?: unknown;
  /** Order shares alias. Adapters size by amount, so a present value is refused. */
  orderShares?: unknown;
  /** Base shares alias. Adapters size by amount, so a present value is refused. */
  baseShares?: unknown;
  /** Lots alias. Adapters size by amount, so a present value is refused. */
  lots?: unknown;
  /** Order lots alias. Adapters size by amount, so a present value is refused. */
  orderLots?: unknown;
  /** Base lots alias. Adapters size by amount, so a present value is refused. */
  baseLots?: unknown;
  /** Price alias. Adapters price by price, so a present value is refused. */
  limitPrice?: number | string | boolean;
  /** Limit-price alias. Adapters price by price, so a present value is refused. */
  limitPx?: number | string | boolean;
  /** Price alias. Adapters price by price, so a present value is refused. */
  orderPrice?: number | string | boolean;
  /** Px alias. Adapters price by price, so a present value is refused. */
  px?: number | string | boolean;
  /** Client order id alias. Adapters read clientOrderId only, so a present value is refused. */
  clientOid?: unknown;
  /** New client order id. Adapters read clientOrderId only, so a present value is refused. */
  newClientOrderId?: unknown;
  /** Orig client order id. Adapters read clientOrderId only, so a present value is refused. */
  origClientOrderId?: unknown;
  /** Cancel replace flag. Adapters do not support cancel-replace, so a present value is refused. */
  cancelReplace?: unknown;
  /** Cancel order id. Adapters do not support cancel-replace, so a present value is refused. */
  cancelOrderId?: unknown;
  /** Order id to cancel. Adapters do not support cancel-replace, so a present value is refused. */
  orderIdToCancel?: unknown;
  /** OCO flag. Adapters do not support order lists, so a present value is refused. */
  oco?: unknown;
  /** Order list id. Adapters do not support order lists, so a present value is refused. */
  orderListId?: unknown;
  /** List client order id. Adapters do not support order lists, so a present value is refused. */
  listClientOrderId?: unknown;
  /** Above type. Adapters do not support order lists, so a present value is refused. */
  aboveType?: unknown;
  /** Below type. Adapters do not support order lists, so a present value is refused. */
  belowType?: unknown;
  /** Stop limit price. Adapters do not support order lists, so a present value is refused. */
  stopLimitPrice?: unknown;
  /** Pos idx. Adapters do not support position index, so a present value is refused. */
  posIdx?: unknown;
  /** Hedge idx. Adapters do not support position index, so a present value is refused. */
  hedgeIdx?: unknown;
  /** Tag. Adapters do not forward it, so a present value is refused. */
  tag?: unknown;
  /** Order tag. Adapters do not forward it, so a present value is refused. */
  orderTag?: unknown;
  /** Client tag. Adapters do not forward it, so a present value is refused. */
  clientTag?: unknown;
  /** Order side alias. Adapters read side only, so a present value is refused. */
  orderSide?: unknown;
  /** Direction alias. Adapters read side only, so a present value is refused. */
  direction?: unknown;
  /** Action alias. Adapters read side only, so a present value is refused. */
  action?: unknown;
  /** Pair alias. Adapters read symbol only, so a present value is refused. */
  pair?: unknown;
  /** Market alias. Adapters read symbol only, so a present value is refused. */
  market?: unknown;
  /** Instrument alias. Adapters read symbol only, so a present value is refused. */
  instrument?: unknown;
  /** Account type. Adapters do not route accounts, so a present value is refused. */
  accountType?: unknown;
  /** Account. Adapters do not route accounts, so a present value is refused. */
  account?: unknown;
  /** Funds account. Adapters do not route accounts, so a present value is refused. */
  fundsAccount?: unknown;
  /** API key. Never accepted in order body; keys stay server-side. */
  apiKey?: unknown;
  /** API secret. Never accepted in order body; keys stay server-side. */
  apiSecret?: unknown;
  /** Secret. Never accepted in order body; keys stay server-side. */
  secret?: unknown;
  /** Passphrase. Never accepted in order body; keys stay server-side. */
  passphrase?: unknown;
  /** Signature. Never accepted in order body; keys stay server-side. */
  signature?: unknown;
};

export class OrderManager {
  // ... rest of the class would be here, but for brevity in this example we assume the full content is provided in the actual call
