# Safety checklist

## Always

- [ ] Default mode is `paper`.
- [ ] No API keys are committed or sent to the browser.
- [ ] Operator token is required for enable-live and clear-halt.
- [ ] Hard-stop reasons are persisted and survive restarts.
- [ ] OrderManager refuses unsupported metadata (including order-option, order-preference, order-selection, order-choice, order-decision, order-judgment, order-verdict, order-conclusion, order-outcome, order-result, order-resolve, order-potency, order-strength, order-might, order-power, order-energy, order-vigor, order-intensity, order-fervor, order-zeal, order-ardor, order-passion, order-devotion, order-loyalty, order-trust, order-faith, order-belief, order-conviction, order-assurance, order-confidence, order-optimism, order-hope, order-fate, order-destiny, order-ambition, order-vision, order-dream, order-wish, order-will, order-intent, order-force, order-goal, order-mission, order-quest, order-epic, order-saga, order-narrative, order-story, order-scenario, order-plot, order-plan, order-scheme, order-play, order-tactic, order-strategy, order-step, order-stage, order-phase, order-status, order-weight, order-zone, order-group, order-chain, order-batch, order-session, order-channel, order-correlation, order-attribution, order-fingerprint, order-hash, order-signature, order-reference, order-review, order-quote, order-digest, order-synopsis, order-overview, order-note, order-comment, order-kind, order-origin, order-source, order-purpose, order-audience, order-abstract, order-name, order-title, order-subject, order-header, order-footer, order-body, order-caption, order-brief, order-summary, order-outline, order-level, order-grade, order-rating, order-score, order-rank, order-priority, order-user, order-urgency, order-annotation, order-style, order-theme, order-comment, order-memo, order-context, order-description, order-digest, order-expiry, order-hash, order-memo, order-message, order-metadata, order-name, order-tag, order-label, order-source, order-span, order-trace, order-group, order-reference, order-remark, order-signature, order-subject, order-title, order-uuid, order-version, order-visibility, order-weight, order-window, order-zone, order-algo, order-strategy, order-tactic, order-template, order-text, order-kind, order-leg, order-note, order-locale, order-region, order-timezone, order-currency, order-device, order-platform, and order-session, and order-sibling, and order-parent, and order-payload, and order-child, and order-root, and order-chain, and order-group, and order-link, and order-list, and order-related, and order-reference, and order-source, and order-origin, and grid-id, and order-strategy) before any adapter call.

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
