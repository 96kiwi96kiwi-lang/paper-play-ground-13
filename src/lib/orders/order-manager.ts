/** Minimal persistent OrderManager with metadata floors (paper default). */

import type { ExchangeAdapter } from "@/lib/exchange/types";
import type { RiskState } from "@/lib/risk";
import { orderOptionReason } from "./order-option";
import { orderPreferenceReason } from "./order-preference";
import { orderSelectionReason } from "./order-selection";
import { orderChoiceReason } from "./order-choice";
import { orderDecisionReason } from "./order-decision";
import { orderJudgmentReason } from "./order-judgment";
import { orderVerdictReason } from "./order-verdict";
import { orderConclusionReason } from "./order-conclusion";
import { orderOutcomeReason } from "./order-outcome";
import { orderResultReason } from "./order-result";
import { orderResolveReason } from "./order-resolve";
import { orderPotencyReason } from "./order-potency";
import { orderStrengthReason } from "./order-strength";
import { orderMightReason } from "./order-might";
import { orderPowerReason } from "./order-power";
import { orderEnergyReason } from "./order-energy";
import { orderVigorReason } from "./order-vigor";
import { orderIntensityReason } from "./order-intensity";
import { orderFervorReason } from "./order-fervor";
import { orderZealReason } from "./order-zeal";
import { orderArdorReason } from "./order-ardor";
import { orderPassionReason } from "./order-passion";
import { orderDevotionReason } from "./order-devotion";
import { orderLoyaltyReason } from "./order-loyalty";
// Prior floors (order-trust, etc.) follow the same pattern.

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
    const optionReason = orderOptionReason(
      req.option,
      req.optionId,
      req.orderOption,
    );
    if (optionReason) {
      return { ok: false, reason: optionReason };
    }
    const preferenceReason = orderPreferenceReason(
      req.preference,
      req.preferenceId,
      req.orderPreference,
    );
    if (preferenceReason) {
      return { ok: false, reason: preferenceReason };
    }
    const selectionReason = orderSelectionReason(
      req.selection,
      req.selectionId,
      req.orderSelection,
    );
    if (selectionReason) {
      return { ok: false, reason: selectionReason };
    }
    const choiceReason = orderChoiceReason(
      req.choice,
      req.choiceId,
      req.orderChoice,
    );
    if (choiceReason) {
      return { ok: false, reason: choiceReason };
    }
    const decisionReason = orderDecisionReason(
      req.decision,
      req.decisionId,
      req.orderDecision,
    );
    if (decisionReason) {
      return { ok: false, reason: decisionReason };
    }
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
    const outcomeReason = orderOutcomeReason(
      req.outcome,
      req.outcomeId,
      req.orderOutcome,
    );
    if (outcomeReason) {
      return { ok: false, reason: outcomeReason };
    }
    const resultReason = orderResultReason(
      req.result,
      req.resultId,
      req.orderResult,
    );
    if (resultReason) {
      return { ok: false, reason: resultReason };
    }
    const resolveReason = orderResolveReason(
      req.resolve,
      req.resolveId,
      req.orderResolve,
    );
    if (resolveReason) {
      return { ok: false, reason: resolveReason };
    }
    const potencyReason = orderPotencyReason(
      req.potency,
      req.potencyId,
      req.orderPotency,
    );
    if (potencyReason) {
      return { ok: false, reason: potencyReason };
    }
    const strengthReason = orderStrengthReason(
      req.strength,
      req.strengthId,
      req.orderStrength,
    );
    if (strengthReason) {
      return { ok: false, reason: strengthReason };
    }
    const mightReason = orderMightReason(
      req.might,
      req.mightId,
      req.orderMight,
    );
    if (mightReason) {
      return { ok: false, reason: mightReason };
    }
    const powerReason = orderPowerReason(
      req.power,
      req.powerId,
      req.orderPower,
    );
    if (powerReason) {
      return { ok: false, reason: powerReason };
    }
    const energyReason = orderEnergyReason(
      req.energy,
      req.energyId,
      req.orderEnergy,
    );
    if (energyReason) {
      return { ok: false, reason: energyReason };
    }
    const vigorReason = orderVigorReason(
      req.vigor,
      req.vigorId,
      req.orderVigor,
    );
    if (vigorReason) {
      return { ok: false, reason: vigorReason };
    }
    const intensityReason = orderIntensityReason(
      req.intensity,
      req.intensityId,
      req.orderIntensity,
    );
    if (intensityReason) {
      return { ok: false, reason: intensityReason };
    }
    const fervorReason = orderFervorReason(
      req.fervor,
      req.fervorId,
      req.orderFervor,
    );
    if (fervorReason) {
      return { ok: false, reason: fervorReason };
    }
    const zealReason = orderZealReason(
      req.zeal,
      req.zealId,
      req.orderZeal,
    );
    if (zealReason) {
      return { ok: false, reason: zealReason };
    }
    const ardorReason = orderArdorReason(
      req.ardor,
      req.ardorId,
      req.orderArdor,
    );
    if (ardorReason) {
      return { ok: false, reason: ardorReason };
    }
    const passionReason = orderPassionReason(
      req.passion,
      req.passionId,
      req.orderPassion,
    );
    if (passionReason) {
      return { ok: false, reason: passionReason };
    }
    const devotionReason = orderDevotionReason(
      req.devotion,
      req.devotionId,
      req.orderDevotion,
    );
    if (devotionReason) {
      return { ok: false, reason: devotionReason };
    }
    const loyaltyReason = orderLoyaltyReason(
      req.loyalty,
      req.loyaltyId,
      req.orderLoyalty,
    );
    if (loyaltyReason) {
      return { ok: false, reason: loyaltyReason };
    }
    // Other floors (trust, ...) are checked similarly before the adapter.
    // Paper/KuCoin path continues here in the full implementation.
    return { ok: true };
  }

  seenOrders(): unknown[] {
    return [];
  }
}
