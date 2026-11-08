# Development progress

## 2026-11-08 03:00 CET

- **Verified state:** `main` was `9f951de45bf7719adddd3bf8a88a5bf79001ccbd`; its `src/lib/orders/order-manager.ts` contained only `PLACEHOLDER_WILL_FAILPLACEHOLDER_WILL_FAIL`. PR #11 remained open but was 94 commits behind; PR #8 remained open with no unique diff. There were no open issues or TODO/FIXME markers.
- **Completed change:** restored the full persistent `OrderManager` runtime from the reviewed PR #11 implementation, then integrated all metadata floors currently documented on `main`, including algo/strategy/tactic, kind/leg, locale/region/timezone/currency/device/platform, sibling/parent/child/root, and related identity fields. Added an integration regression proving 22 representative metadata fields fail through `OrderManager.submit()` before adapter invocation.
- **Verification:** TypeScript passed; targeted runtime/floor tests passed (45/45); full Vitest passed (611/611 across 231 files); production Vite/SSR/Nitro build passed; built-server and worker smoke tests passed without exchange credentials or network-backed trading.
- **Open problem:** GitHub Actions created no run for the previous integrated PR #11 SHA after an earlier billing-lock failure. The new final SHA must still receive real CI before merge or deployment.
- **Next priority:** publish this verified branch without rewriting history, then require green final-head CI before merge or Railway deployment.
