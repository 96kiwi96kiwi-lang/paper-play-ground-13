# Safety checklist

## Always

- [ ] Default mode is `paper`.
- [ ] No API keys are committed or sent to the browser.
- [ ] Operator token is required for enable-live and clear-halt.
- [ ] Hard-stop reasons are persisted and survive restarts.
- [ ] OrderManager refuses unsupported metadata (including order-structure, order-shape, order-form, order-pattern, order-motif, order-theme, order-subject, order-style, order-status, order-phase, order-stage, order-step, order-strategy, order-tactic, order-play, order-scheme, order-plan, order-plot, order-scenario, order-story, order-narrative, order-saga, order-epic, order-quest, order-mission, order-goal, order-force, order-intent, order-will, order-dream, order-vision, order-ambition, order-destiny, order-fate, order-wish, order-hope, order-optimism, order-belief, order-faith, order-trust, order-allegiance, order-loyalty, order-devotion, order-passion, order-ardor, order-zeal, order-fervor, order-intensity, order-vigor, order-energy, order-power, order-might, order-strength, order-potency, and earlier metadata floors) before any adapter call.

## Before any live enablement

- [ ] KuCoin API key created with **Trade only** (Withdraw disabled).
- [ ] Keys set only in the server environment.
- [ ] `KUCOIN_ALLOW_UNVERIFIED_KEY` left unset unless you have manually verified the key page.
- [ ] Paper book and risk state reviewed.
- [ ] Operator token generated locally and kept secret.

## Hard-stops (automatic)

- Daily loss limit
- Max drawdown
- Losing streak
- Price gap
- Network error streak

Clearing a halt requires the operator token and explicit confirmation. It does not enable live mode.
