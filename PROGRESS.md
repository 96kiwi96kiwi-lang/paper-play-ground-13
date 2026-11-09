# Development progress

## 2026-11-09 06:00 CET

- **Verified state:** `main` advanced to `8a3a42933edfbe96b8fd585dec713abb293ad199` with grid-id, order-algo, and order-strategy floor wiring. PR #13 remained open at `02ef3b0788d1263bbe9dc79c7cdfdd0dc64ef697`; dependent PR #14 remained open at `a84c155b2b9f733508c7c979e7b2fd146b3ee925`. PR #11, PR #8, and PR #12 remained open and stale. There were no open issues or actionable TODO/FIXME markers; CI #634 and #635 still failed before all steps with no runner logs.
- **Completed change:** merged current `main` into PR #13 without rewriting history and retained the complete persistent `OrderManager`. The real runtime already enforced grid, algo, and strategy floors; expanded the integration regression to prove every new canonical/client alias (`grid`, `gridId`, `algoId`, `algoType`, `clientAlgo`, `strategyId`, `clientStrategy`) fails before adapter invocation.
- **Verification:** TypeScript passed; targeted grid/algo/strategy/runtime/paper-loop/lease tests passed (27/27); full Vitest passed (613/613 across 231 files); production Vite/SSR/Nitro build, built-server smoke, and worker smoke passed without exchange credentials or network-backed trading.
- **Open problem:** GitHub Actions billing still prevents a real runner from executing. This exact final SHA must not be merged or deployed before successful CI; dependent PR #14 must be synchronized onto the new PR #13 head afterward.
- **Next priority:** publish this verified merge to PR #13, inspect exact-head CI, then merge the updated PR #13 branch into dependent PR #14 without force-push and re-run its quote regressions.

## 2026-11-09 01:00 CET

- **Verified state:** `main` advanced to `e2358c8f1342eb846bb2640141e52079a2d3e7b9` with reference/source/origin metadata-floor wiring. PR #13 remained open at `4e68e8fa8f1e2aafec438f5cd655fe0694d1d39a`; PR #11 and PR #8 remained open and stale. There were no open issues or actionable TODO/FIXME markers.
- **Completed change:** merged current `main` into PR #13 without rewriting history, retained the complete persistent `OrderManager`, and integrated the new reference/source/origin floors into the real runtime. Added the canonical `clientSource` alias without dropping the legacy `src` alias, and expanded the runtime regression to prove all reference/source/origin aliases fail before adapter invocation.
- **Verification:** TypeScript passed; focused source/reference/origin/runtime tests passed (13/13); paper-loop and worker-lease tests passed (18/18); full Vitest passed (613/613 across 231 files); production build, built-server smoke, and worker smoke passed without exchange credentials or network-backed trading.
- **Open problem:** GitHub Actions on the previous PR #13 head failed before all steps with no runner log, consistent with the account billing lock. This exact final SHA still requires real successful CI before merge or deployment.
- **Next priority:** publish this verified merge to PR #13 and inspect final-head CI; then re-parent the locally verified fail-closed public quote fallback onto the synchronized PR branch.

## 2026-11-08 19:00 CET

- **Verified state:** `main` advanced to `2929b472503ba8fbf6c45ef82c1c8f9c3147612e` with chain/group/link/list/related metadata-floor commits. PR #13 remained open and locally verified but was nine commits behind; PR #11 and PR #8 remained open and stale. There were no open issues or actionable TODO/FIXME markers.
- **Completed change:** merged current `main` into PR #13 without rewriting history, retained the full persistent `OrderManager`, and wired the new chain and related aliases into the real runtime submit path. The current linked-order aliases are also refused while legacy `clOrdId`/`orderLinkId` remain fail closed. Extended the integration regression to cover all six chain/related fields before adapter invocation.
- **Verification:** on this exact merge tree, TypeScript passed; targeted chain/related/link/list/runtime/restart/lease tests passed (31/31); full Vitest passed (613/613 across 231 files); production build, built-server smoke, and worker smoke passed without exchange credentials or network-backed trading.
- **Open problem:** GitHub Actions on the previous PR #13 head still failed before all steps with no runner log, consistent with the account billing lock. This new final SHA must receive real successful CI before merge or deployment.
- **Next priority:** complete local typecheck, targeted and full Vitest, production build, built-server smoke, and worker smoke; publish the verified merge to PR #13; then re-parent the locally verified public quote fallback onto it.

## 2026-11-08 08:00 CET

- **Verified state:** `main` advanced to `36b463184baedf54269b1d2a361a2eda6f864bd8`, but its 7 KB `OrderManager` still omits the persistent runtime, restart recovery, and most fail-closed floors restored by PR #13. PR #11 and PR #8 remain open and stale; there are no open issues or TODO/FIXME markers.
- **Completed change:** merged the five new `main` commits into PR #13 without rewriting history, retained its complete `OrderManager`, and incorporated the current sibling/root documentation updates. The restored implementation already enforces those floors before adapter invocation.
- **Verification:** on this exact merge tree, TypeScript passed; targeted OrderManager/sibling/root/restart/lease tests passed (19/19); full Vitest passed (611/611 across 231 files); production build, built-server smoke, and worker smoke passed without exchange credentials or network-backed trading.
- **Open problem:** GitHub Actions for the prior PR #13 head was blocked before steps by the account billing lock. This merge must not be merged or deployed until its exact final SHA has real successful CI.
- **Next priority:** run the complete local verification on this merge tree, publish it to PR #13, then inspect final-head CI. After that, re-parent the already locally verified public quote fallback onto the synchronized PR #13 branch without force-push.

## 2026-11-08 03:00 CET

- **Verified state:** `main` was `9f951de45bf7719adddd3bf8a88a5bf79001ccbd`; its `src/lib/orders/order-manager.ts` contained only `PLACEHOLDER_WILL_FAILPLACEHOLDER_WILL_FAIL`. PR #11 remained open but was 94 commits behind; PR #8 remained open with no unique diff. There were no open issues or TODO/FIXME markers.
- **Completed change:** restored the full persistent `OrderManager` runtime from the reviewed PR #11 implementation, then integrated all metadata floors currently documented on `main`, including algo/strategy/tactic, kind/leg, locale/region/timezone/currency/device/platform, sibling/parent/child/root, and related identity fields. Added an integration regression proving 22 representative metadata fields fail through `OrderManager.submit()` before adapter invocation.
- **Verification:** TypeScript passed; targeted runtime/floor tests passed (45/45); full Vitest passed (611/611 across 231 files); production Vite/SSR/Nitro build passed; built-server and worker smoke tests passed without exchange credentials or network-backed trading.
- **Open problem:** GitHub Actions created no run for the previous integrated PR #11 SHA after an earlier billing-lock failure. The new final SHA must still receive real CI before merge or deployment.
- **Next priority:** publish this verified branch without rewriting history, then require green final-head CI before merge or Railway deployment.
