# AI Gist agent instructions

本分支只保留移动端（iOS / Android，Capacitor 壳）。桌面端（Electron + electron-builder）、桌面 Web、以及全部 AI 功能（生成、优化、快速优化、AI 配置）都已从本分支删除：不要重新引入 `src/main`、`config/electron-builder*`、`scripts/build.js`、`bin/`、Naive UI，也不要再加回 AI 生成/优化相关的页面、服务、路由和测试。

移动端页面（`src/renderer/pages/mobile/**`）保持 Ionic 原生结构；除非任务明确要求重做移动端设计，否则不要套用 [`docs/AI_UI_DESIGN_PROMPT.md`](docs/AI_UI_DESIGN_PROMPT.md) 里的桌面设计语言。改动 `src/renderer` 下的样式时仍然要用它定义的公共设计 token，不要自建本地主题系统、不要复活已废弃的变量。

## 数据

数据只存在于运行中的应用进程里（IndexedDB）。本分支没有命令行入口，不要试图从终端或 agent 会话里读写数据，也不要直接操作 IndexedDB 文件。

## 版本号

版本信息只在 `package.json` 的 `version` 和 `buildRevision` 里手写（读作 `2.1.1 (1)`），各平台的构建号从这两个字段推导，改完后运行 `yarn version:sync` 同步到原生工程。规则见 [`docs/versioning.md`](docs/versioning.md)，不要手改 `build.gradle` 或 `project.pbxproj` 里的版本字段。

