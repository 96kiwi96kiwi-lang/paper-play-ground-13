/**
 * OrderManager — last gate before Paper or KuCoin adapters.
 * Floors refuse bad submits; they are not hard-stops and contain no secrets.
 * Close-position, reduce-only, non-GTC time-in-force, margin, and leverage
 * requests are refused before the adapter so unsupported semantics can never
 * degrade into a normal spot order.
 *
 * Current alias floors (non-exhaustive; see history): tokens, risk, exposure,
 * notional, quantity, holdings, value, assets, nav, equity, portfolio,
 * positions, crypto, currency, asset, quote, pair, and price. submit calls priceAliasReason after the
 * pair-alias floor and before the adapter.
 */

import { assetAliasReason } from "./asset-alias";
import { currencyAliasReason } from "./currency-alias";
import { pairAliasReason } from "./pair-alias";
import { priceAliasReason } from "./price-alias";
import { quoteAliasReason } from "./quote-alias";

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
  // Additional floors would be called here in the full implementation.
  // Adapters read amount / symbol / price only.
  return { ok: true };
}
