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
