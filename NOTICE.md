# Fork Modification Notices

> This file documents all modifications made to this fork in accordance with
> AGPL v3.0 Section 5(a), which requires modified files to carry prominent
> notices stating that you changed the files and the date of any change.

## Fork Information

- **Original project**: [AI Gist](https://github.com/yarin-zhang/AI-Gist) by [Yarin Zhang](https://github.com/yarin-zhang)
- **Fork maintainer**: 兔叽 ([@msiya8160-star](https://github.com/msiya8160-star))
- **Fork URL**: [https://github.com/msiya8160-star/AI-Gist-Tuji](https://github.com/msiya8160-star/AI-Gist-Tuji)
- **License**: AGPL-3.0-only (same as original)

---

## Modification Log

### 2026-10-21 — AGPL v3.0 Compliance Updates (Commit 8922779)

#### Files with inline modification notices:
- `README.md` — Added fork attribution banner at top
- `docs/README.en.md` — Added fork attribution banner at top
- `CODE_SIGNING_POLICY.md` — Added fork notice, preserved upstream signing info
- `PRIVACY.md` — Updated issue tracker links, added fork notice
- `src/renderer/components/settings/AboutSettings.vue` — Added fork/upstream info, updated URLs
- `src/renderer/pages/mobile/MobileAboutPage.vue` — Added fork/upstream info, updated URLs
- `src/renderer/composables/useUpdate.ts` — Updated repo owner/name for update checks

#### Files modified (JSON format, no inline comments possible):
- `package.json` — Added `"license": "AGPL-3.0-only"`, updated `repository`, added `contributors`
- `src/renderer/i18n/locales/en-US.json` — Updated `githubRepo`, added fork-related keys
- `src/renderer/i18n/locales/zh-CN.json` — Updated `githubRepo`, added fork-related keys
- `src/renderer/i18n/locales/zh-TW.json` — Updated `githubRepo`, added fork-related keys
- `src/renderer/i18n/locales/ja-JP.json` — Updated `githubRepo`, added fork-related keys
- `src/renderer/i18n/locales/it-IT.json` — Updated `githubRepo`, added fork-related keys
- `config/electron-builder.json` — Updated publish owner/repo to fork
- `resources/store/listing.zh-CN.md` — Updated store listing links to fork

### 2026-10-21 — Android Package Name Update (Commit d18a2e9)

#### Files with inline modification notices:
- `capacitor.config.ts` — Changed `appId` to `com.msiya8160.aigist`
- `android/app/build.gradle` — Changed `namespace` and `applicationId`
- `android/app/src/main/java/com/msiya8160/aigist/MainActivity.java` — Changed package name
- `android/app/src/main/java/com/msiya8160/aigist/WebDavPlugin.java` — Changed package name
- `android/app/src/main/res/values/strings.xml` — Changed `package_name` and `custom_url_scheme`

### 2026-10-21 — Mobile Category Management Page (Commit 9ab2263)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobileCategoryPage.vue` — New file: mobile category management page (later removed)
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Added category management button (later removed)
- `src/renderer/router/mobile.ts` — Added `/category` route (later removed)

#### Files modified (JSON format, no inline comments possible):
- `src/renderer/i18n/locales/zh-CN.json` — Added category management translations

### 2026-10-21 — Inline Category Creation in Edit Page (Commit 357e78b)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Added inline category creation feature

### 2026-10-21 — Category Tabs and Management in Filter (Commit 989b51a)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Added category tabs + moved category management to filter modal
- `src/renderer/router/mobile.ts` — Removed `/category` route

#### Files removed:
- `src/renderer/pages/mobile/MobileCategoryPage.vue` — Removed (functionality moved to filter modal)

### 2026-10-21 — Fix Duplicate Category List (Commit 29110a1)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Merged category filter and management into single list

### 2026-10-21 — Hide Category Filter Chip (Commit ac8e54b)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Hide category filter chip (category already shown in tabs)

### 2026-10-21 — Fix Create Category Button (Commit 96994cf)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Fix create category button not opening modal

### 2026-10-21 — Fix Create Category Save and Remove Color Dots (Commit 1667e5f)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Fix categoryFormData.value not being set in create button
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Remove color dot from category pills

### 2026-10-22 — Add Credential Type for Account/Password Records (Commit 17f4e53)

#### Files with inline modification notices:
- `src/shared/types/database.ts` — Added 'type' field to Prompt interface
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Added type selector UI
- `src/renderer/pages/mobile/MobilePromptDetailPage.vue` — Added credential parsing and individual copy buttons

### 2026-10-22 — Improve Credential Type with Dedicated Fields (Commit b79261e)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Title=account, content=password with eye toggle
- `src/renderer/pages/mobile/MobilePromptDetailPage.vue` — Account/password display with inline copy buttons

### 2026-10-22 — Fix Credential Field Mapping (Commit f1016e9)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Content=account, description=password
- `src/renderer/pages/mobile/MobilePromptDetailPage.vue` — Updated field mapping for display

### 2026-10-22 — Fix Password Display in Header (Commit 250fecc)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptDetailPage.vue` — Hide description in header for credentials type

### 2026-10-22 — Fix Password Display on Homepage (Commit b144832)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Show account instead of password in list view for credentials type

### 2026-10-22 — Fix Account Display on Homepage (Commit d50179d)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Show account content directly without prefix

### 2026-10-22 — Hide Subtitle for Credentials Type (Commit dd6f57e)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Only show title for credentials type on homepage

### 2026-10-23 — Fix Description Display Logic (Commit fd78adf)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Use 'type === prompt' instead of 'type !== credentials'

### 2026-10-23 — Fix Waterfall View Description Display (Commit fb1b308)

#### Files with inline modification notices:
- `src/renderer/components/mobile/MobileWaterfallView.vue` — Hide description for credentials type

### 2026-10-23 — Support Multiple Passwords (Commit 7eb28fe)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Multiple password inputs with add/remove
- `src/renderer/pages/mobile/MobilePromptDetailPage.vue` — Display multiple passwords with copy buttons

### 2026-10-23 — Fix Unsaved Changes Dialog (Commit 5d4ed1f)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Update description when parsing passwords

### 2026-10-23 — Add URL Field to Credentials (Commit 566cb9f)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Add URL input for credentials type
- `src/renderer/pages/mobile/MobilePromptDetailPage.vue` — Show URL with click-to-open link

### 2026-10-23 — Fix Build Error (Commit fb64467)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptDetailPage.vue` — Use window.open instead of CapacitorApp

### 2026-10-23 — Fix URL Save (Commit b17fc91)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Save URL to description JSON

### 2026-10-23 — Fix Unsaved Changes During Loading (Commit adcbca3)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Add loading flag to prevent false positive

### 2026-10-23 — Fix Category Count Display (Commit 9aa5b0f)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Show correct prompt count for all categories

### 2026-10-23 — Add Category Delete Feature (Commit 2f4eacb)

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Swipe-to-delete categories in filter modal

### 2026-10-23 — Version Bump to 2.1.4 (Commit 03665a0)

#### Files with inline modification notices:
- `package.json` — version 2.1.3 -> 2.1.4, buildRevision 1 -> 2
- `android/app/build.gradle` — versionCode 2010301 -> 2010402, versionName 2.1.3 -> 2.1.4
- `ios/App/App.xcodeproj/project.pbxproj` — MARKETING_VERSION 2.1.3 -> 2.1.4, CURRENT_PROJECT_VERSION 1 -> 2

### 2026-10-23 — Fix Update Check (Commit 4bba38a)

#### Files with inline modification notices:
- `src/renderer/composables/useUpdate.ts` — Handle version tags with suffixes

### 2026-10-25 — Mobile Prompt Optimization Workbench

#### Files with inline modification notices:
- `src/renderer/pages/mobile/MobilePromptOptimizePage.vue` — New: mobile AI prompt optimization workbench
- `src/renderer/pages/mobile/MobilePromptDetailPage.vue` — Added AI optimization entry; hide empty credential rows
- `src/renderer/pages/mobile/MobilePromptEditPage.vue` — Allow website-only credential records
- `src/renderer/pages/mobile/MobilePromptPage.vue` — Two-column category card home + website-only display title
- `src/renderer/router/mobile.ts` — Added `/prompt/optimize/:id` and `/category/:id` routes
- `src/renderer/lib/prompt-optimization/templates.ts` — New: optimization / iteration / evaluation prompt builders
- `src/renderer/lib/prompt-optimization/diff.ts` — New: line-level diff for the comparison tab
- `src/renderer/lib/services/mobile-ai-generator.service.ts` — Added custom-system/user chat generation with streaming and stop support
- `src/renderer/lib/utils/prompt-display.ts` — New: display-title fallback, including website-only credentials
- `src/renderer/pages/mobile/MobileAIConfigEditPage.vue` — Sync autofilled API key from the ion-input host element

#### Reference / inspiration:
- The mobile optimization flow (single-click optimization, multi-round iteration, comparison, and AI evaluation) is inspired by [Prompt Optimizer](https://github.com/linshenkx/prompt-optimizer) by linshenkx, licensed under AGPL-3.0. The implementation is adapted to AI Gist's existing prompt model and is not a verbatim copy of that project's source files.

### 2026-10-25 — Surface Prompt Optimizer Attribution in README Banner

#### Files with inline modification notices:
- `README.md` — Added Prompt Optimizer attribution line to the top fork banner, linking to the detailed notice at the bottom
- `docs/README.en.md` — Added the same attribution line to the top fork banner

### 2026-10-26 — Native HTTP Fallback for AI Requests (SenseNova-class gateways)

#### Files with inline modification notices:
- `src/renderer/lib/services/native-http.ts` — New file: fetch-like helper that retries WebView network-layer failures (e.g. CORS preflight 404 from `https://token.sensenova.cn/v1`) once through CapacitorHttp on native builds; includes a Response-equivalent shim
- `src/renderer/lib/services/mobile-ai.service.ts` — `fetchWithTimeout` and the intelligent-test request paths now go through `fetchWithNativeFallback`; `readErrorMessage` accepts the response shim
- `src/renderer/lib/services/mobile-ai-generator.service.ts` — OpenAI-compatible and Anthropic chat calls degrade to a native non-streaming request when the WebView streaming fetch fails at the network layer on native builds (no AbortSignal on the native path; `onProgress` fires once with the full result)

#### New tests:
- `test/mobile/native-http-fallback.test.ts` — Covers fallback trigger conditions (TypeError only, native builds only, HTTP error responses not retried), the response shim, JSON body parsing, and the generator's degraded chat path

#### Background:
- Some OpenAI-compatible gateways (notably SenseNova Token Plan at `https://token.sensenova.cn/v1`) respond to CORS preflight (OPTIONS) with 404, so WKWebView / Android WebView blocks requests before they are sent. Native CapacitorHttp has no CORS concept and reaches these endpoints directly. Web and Electron builds are unchanged.

---

### 2026-10-26 — Execution-Based Evaluation for the Mobile Optimization Workbench

#### Files with inline modification notices:
- `src/renderer/lib/prompt-optimization/execution-eval.ts` — New file: test-input generation prompts, variable filling (`fillPromptContent`), execution snapshot evidence model, execution-based comparison evaluation builder and lenient parser
- `src/renderer/lib/prompt-optimization/templates.ts` — Added a "理解示例" (anti-execution few-shot) section to the shared optimization system prompt
- `src/renderer/lib/prompt-optimization/diff.ts` — Added word-level inline diff (`tokenizeForDiff`, `diffRowsWithWords`) on top of the existing line-level LCS
- `src/renderer/pages/mobile/MobilePromptOptimizePage.vue` — Added evaluation mode switch (quick review / run-based), test-input editor with per-prompt localStorage persistence, AI test-input generation, sequential execution of original vs optimized prompts, snapshot list, per-test-case findings, and word-level compare rendering

#### Files modified (JSON format, no inline comments possible):
- `src/renderer/i18n/locales/zh-CN.json` — Added execution evaluation keys and 3 new evaluation dimension labels
- `src/renderer/i18n/locales/zh-TW.json` — Same as above
- `src/renderer/i18n/locales/en-US.json` — Same as above
- `src/renderer/i18n/locales/ja-JP.json` — Same as above
- `src/renderer/i18n/locales/it-IT.json` — Same as above

#### New tests:
- `test/mobile/prompt-optimization-execution-eval.test.ts` — Unit tests for filling, execution messages, test-input generation/parsing, evaluation prompt evidence, response parsing, and word-level diff

#### Reference / inspiration:
- The execution-based evaluation flow (shared test inputs → running both prompt versions against the same model → comparing the real outputs with a single evidence-grounded evaluation call) is inspired by the evaluation design of [Prompt Optimizer](https://github.com/linshenkx/prompt-optimizer) by linshenkx (AGPL-3.0): its `EvaluationTestCase` / `EvaluationSnapshot` / compare-evaluation types in `packages/core/src/services/evaluation` and its test-input/variable-value generation templates. The implementation is adapted to AI Gist's single-prompt data model and the mobile AI service layer, and is not a verbatim copy of that project's source files.
- The anti-execution few-shot examples in the optimization system prompt follow the pedagogical idea of Prompt Optimizer's iterate template examples (distinguishing "modifying the prompt" from "executing the prompt"), rewritten independently.
- The word-level compare display follows Prompt Optimizer's word-diff presentation idea (it uses the jsdiff library); this fork implements an equivalent zero-dependency token-level LCS.

---

### 2026-10-26 — Mobile-only branch: AI features and desktop app removed (branch `no-ai-mobile`)

This branch deletes the whole AI feature set and the entire desktop application. It only ships iOS / Android builds through Capacitor.

#### Deleted
- `src/main/` — the entire Electron main process (main.ts, preload.ts, ai/, cloud/, data/, electron/, ipc)
- `bin/` — local CLI entry point
- `docker/`, `docker-compose.web.yml`, `.dockerignore`, `.github/workflows/build-release.yml` — desktop / container release tooling
- `config/electron-builder.json`, `config/electron-builder.mas.js`, `config/electron-builder.snap.js`, `config/vite.config.js`, `config/vite.config.web.js`
- `scripts/build.js`, `scripts/dev-server.js`, `scripts/web-server.js`, `scripts/adhoc-sign-mac.js`, `scripts/private/`
- `src/shared/ai-provider-metadata.ts`, `src/shared/types/cli-bridge.ts`
- Desktop pages, AI pages, AI components, AI services and API clients, desktop settings / shortcuts / example components, and the matching test suites (see the branch diff for the full file list)

#### Modified
- `package.json` — dropped `main`, `bin`, desktop build scripts, and the electron / desktop / AI dependencies
- `src/renderer/App.vue`, `src/renderer/main.ts`, `src/renderer/router/mobile.ts` — mobile-only shell and router (AI config, generator and optimize routes gone)
- `src/renderer/pages/MobileMainPage.vue`, `src/renderer/pages/mobile/MobilePromptPage.vue`, `src/renderer/pages/mobile/MobilePromptDetailPage.vue` — AI tab, AI generator modal and optimize entry removed
- `src/renderer/composables/useTheme.ts`, `src/renderer/theme/index.ts` — Naive UI theme overrides removed
- `src/renderer/lib/services/index.ts`, `src/renderer/lib/api/index.ts` — AI exports removed
- `src/shared/index.ts`, `src/shared/types/index.ts`, `src/shared/types/electron-api.ts` — cli-bridge exports removed
- `config/eslint.config.mjs`, `tsconfig.json`, `src/renderer/tsconfig.json`, `config/vite.config.mobile.js`, `config/vitest.config.ts` — `@main` alias removed
- `src/renderer/i18n/locales/*.json` — AI and desktop-only translation keys removed, missing mobile keys added
- `src/renderer/assets/styles/global.css` — launcher and Naive UI modal rules removed
- `scripts/version.js`, `scripts/sync-version.js`, `docs/versioning.md` — desktop / Mac App Store version outputs removed
- `AGENTS.md`, `README.md` — desktop and AI references updated

The dated entries above are kept as a historical record of earlier modifications; some of the files they list were later deleted by this branch.

---

## Files NOT Modified

The following critical files remain **unchanged** from the original project:

- `LICENSE` — GNU AGPL v3.0 license text (AGPL requires this remain intact)
- All source code files under `src/` that were not listed above
- Original author attribution in `package.json` (`"author": "Yarin Zhang"`)

---

## Source Code Availability (AGPL Section 13)

The complete source code of this fork is available at:
**https://github.com/msiya8160-star/AI-Gist-Tuji**

If you modify this program to provide facilities for accessing and copying its output by network users, you must make the modified source code available to those users.
