/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
 *
 * Current alias floors (non-exhaustive; see history): tokens, risk, exposure,
 * notional, quantity, holdings, value, assets, nav, equity, portfolio,
 * positions, crypto, currency, asset, quote, pair, price, product, side, size, order-type, and client-id.
 * submit calls clientIdAliasReason after the order-type alias floor and before the adapter.
 */

import { assetAliasReason } from "./asset-alias";
import { clientIdAliasReason } from "./client-id-alias";
import { currencyAliasReason } from "./currency-alias";
import { orderTypeAliasReason } from "./order-type-alias";
import { pairAliasReason } from "./pair-alias";
import { priceAliasReason } from "./price-alias";
import { productAliasReason } from "./product-alias";
import { quoteAliasReason } from "./quote-alias";
import { sideAliasReason } from "./side-alias";
import { sizeAliasReason } from "./size-alias";

export type OrderIntent = {
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  type?: "market" | "limit";
  price?: number;
  // Alias fields that must not be present
  currency?: unknown;
  orderCurrency?: unknown;
  baseCurrency?: unknown;
  asset?: unknown;
  orderAsset?: unknown;
  baseAsset?: unknown;
  quote?: unknown;
  orderQuote?: unknown;
  baseQuote?: unknown;
  pair?: unknown;
  market?: unknown;
  instrument?: unknown;
  px?: unknown;
  limitPx?: unknown;
  orderPrice?: unknown;
  limitPrice?: unknown;
  product?: unknown;
  instId?: unknown;
  ticker?: unknown;
  orderSide?: unknown;
  direction?: unknown;
  action?: unknown;
  qty?: unknown;
  size?: unknown;
  quantity?: unknown;
  ordType?: unknown;
  orderType?: unknown;
  order_type?: unknown;
  clientOid?: unknown;
  newClientOrderId?: unknown;
  origClientOrderId?: unknown;
};

export function submit(intent: OrderIntent): { ok: true } | { ok: false; reason: string } {
  const currencyReason = currencyAliasReason(intent.currency, intent.orderCurrency, intent.baseCurrency);
  if (currencyReason) {
    return { ok: false, reason: currencyReason };
  }
  const assetReason = assetAliasReason(intent.asset, intent.orderAsset, intent.baseAsset);
  if (assetReason) {
    return { ok: false, reason: assetReason };
  }
  const quoteReason = quoteAliasReason(intent.quote, intent.orderQuote, intent.baseQuote);
  if (quoteReason) {
    return { ok: false, reason: quoteReason };
  }
  const pairReason = pairAliasReason(intent.pair, intent.market, intent.instrument);
  if (pairReason) {
    return { ok: false, reason: pairReason };
  }
  const priceReason = priceAliasReason(intent.px, intent.limitPx, intent.orderPrice, intent.limitPrice);
  if (priceReason) {
    return { ok: false, reason: priceReason };
  }
  const productReason = productAliasReason(intent.product, intent.instId, intent.ticker);
  if (productReason) {
    return { ok: false, reason: productReason };
  }
  const sideReason = sideAliasReason(intent.orderSide, intent.direction, intent.action);
  if (sideReason) {
    return { ok: false, reason: sideReason };
  }
  const sizeReason = sizeAliasReason(intent.qty, intent.size, intent.quantity);
  if (sizeReason) {
    return { ok: false, reason: sizeReason };
  }
  const orderTypeReason = orderTypeAliasReason(intent.ordType, intent.orderType, intent.order_type);
  if (orderTypeReason) {
    return { ok: false, reason: orderTypeReason };
  }
  const clientIdReason = clientIdAliasReason(intent.clientOid, intent.newClientOrderId, intent.origClientOrderId);
  if (clientIdReason) {
    return { ok: false, reason: clientIdReason };
  }
  // Additional floors would be called here in the full implementation.
  // Adapters read amount / symbol / price / side / type / clientOrderId only.
  return { ok: true };
}
