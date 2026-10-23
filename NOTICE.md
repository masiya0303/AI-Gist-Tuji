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
