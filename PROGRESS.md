# Progress

## Hour 7 (odd, 2026-11-28): order-form metadata floor

Wired `orderFormReason` into the persistent OrderManager so a present `form`, `orderForm`, or `clientForm` is refused before any adapter call, matching the order-pattern pattern.

- Helper in `src/lib/orders/order-form.ts`.
- Tests in `tests/order-form.test.ts` cover the helper and the submit path.
- Updated README current status, docs/ORDER_FORM_FLOOR.md, and this progress note.

Default remains paper. No secrets. No live trading without server-side owner credentials.

Previous floors (order-pattern, order-motif, etc.) remain in place.

## Hour 5 (odd, 2026-11-28): order-pattern metadata floor

Wired `orderPatternReason` into the persistent OrderManager so a present `pattern`, `orderPattern`, or `clientPattern` is refused before any adapter call, matching the order-motif pattern.

- Helper in `src/lib/orders/order-pattern.ts`.
- Tests in `tests/order-pattern.test.ts` cover the helper and the submit path.
- Updated README current status, docs/ORDER_PATTERN_FLOOR.md, and this progress note.

Default remains paper. No secrets. No live trading without server-side owner credentials.

Previous floors (order-motif, order-theme, etc.) remain in place.

## Hour 3 (odd, 2026-11-28): order-motif metadata floor

Wired `orderMotifReason` into the persistent OrderManager so a present `motif`, `orderMotif`, or `clientMotif` is refused before any adapter call, matching the order-theme pattern.

- Helper in `src/lib/orders/order-motif.ts`.
- Tests in `tests/order-motif.test.ts` cover the helper and the submit path.
- Updated README current status, docs/ORDER_MOTIF_FLOOR.md, and this progress note.

Default remains paper. No secrets. No live trading without server-side owner credentials.

Previous floors (order-theme, order-subject, etc.) remain in place.
