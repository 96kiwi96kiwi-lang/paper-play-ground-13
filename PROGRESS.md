# Development progress

## 2026-11-15 14:00 CET — persistent OrderManager restoration synchronized with current main

### Verified state

- Base advanced from `90e875d9b28a5ea002140af6ea08f493fdfc1d1a` to `b97ca2543acc78a1d6fe7b051c314810b346e1b3` after the restoration PR was opened.
- PR #13 was merged at head `49c5a8ea39be406da39cf97978d9703e57526a40` (merge commit `9a344d7495a1cc9ed7c9e0a7f52be3105d86f48d`), but later main commits replaced the full OrderManager with a reduced implementation.
- The reduced main failed `npm run typecheck` because the paper runtime still required `snapshot`, inventory, cancellation, persistence and restart-recovery methods.
- Draft PR #14 remains dependent on the old PR #13 branch and is not mergeable with current main. Older PRs #11, #12 and #8 remain open and were not modified or closed.

### Completed change

- Restored the full persistent OrderManager runtime contract on current main: constructor state restoration, snapshot/inventory, submit/risk routing, seen-order idempotence, cancellation, portfolio persistence and restart recovery.
- Preserved the post-PR-#13 fail-closed account/style/theme/user/rank/score/rating/grade/level/brief/name checks already present on current main.
- Preserved the explicit current-main order-tag result ahead of its overlapping legacy remark aliases.
- Preserved the new current-main `orderAlgoReason` floor and corrected its positive integration test to satisfy the full runtime's quote-freshness and minimum-notional protections.
- Extended the runtime regression test so the restored contract and the newer metadata floors cannot silently disappear again.
- Corrected positive-path metadata tests to use a fresh, priced offline paper order instead of bypassing quote freshness and minimum-notional protections.

### Local verification

- `npm run typecheck`: PASS.
- `npm test`: PASS, 240 files / 723 tests.
- `npm run build`: PASS.
- `npm run test:smoke`: PASS; production server rendered without exchange credentials.
- `npm run test:worker`: PASS; worker evaluated offline quotes and persisted history without a browser request.

### Open block and next priority

- GitHub Actions must run on the final pushed SHA before any merge; local PASS is not CI PASS.
- Do not synchronize or merge draft PR #14 until this restoration is reviewed and integrated into main. Then rebase its quote-fallback diff onto the resulting main without carrying the obsolete OrderManager copy.
- No deployment was performed. PAPER remains the default; no exchange credentials or live orders were used.
