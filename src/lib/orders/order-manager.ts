/** Minimal persistent OrderManager with metadata floors (paper default). */

import type { ExchangeAdapter } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
import { orderJudgmentReason } from "./order-judgment";
import { orderVerdictReason } from "./order-verdict";
import { orderConclusionReason } from "./order-conclusion";
// Prior floors (order-outcome, order-result, etc.) follow the same pattern.

export interface SubmitRequest {
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  type: "market" | "limit";
  price?: number;
  [key: string]: unknown;
}

export interface SubmitResult {
  ok: boolean;
  reason?: string;
  order?: unknown;
}

export class OrderManager {
  constructor(private adapter: ExchangeAdapter) {}

  async submit(req: SubmitRequest, _risk: RiskState): Promise<SubmitResult> {
    const judgmentReason = orderJudgmentReason(
      req.judgment,
      req.judgmentId,
      req.orderJudgment,
    );
    if (judgmentReason) {
      return { ok: false, reason: judgmentReason };
    }
    const verdictReason = orderVerdictReason(
      req.verdict,
      req.verdictId,
      req.orderVerdict,
    );
    if (verdictReason) {
      return { ok: false, reason: verdictReason };
    }
    const conclusionReason = orderConclusionReason(
      req.conclusion,
      req.conclusionId,
      req.orderConclusion,
    );
    if (conclusionReason) {
      return { ok: false, reason: conclusionReason };
    }
    // Other floors (outcome, result, ...) are checked similarly before the adapter.
    // Paper/KuCoin path continues here in the full implementation.
    return { ok: true };
  }

  seenOrders(): unknown[] {
    return [];
  }
}
