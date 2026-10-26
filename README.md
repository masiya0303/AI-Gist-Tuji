> 🔀 **本分支（`no-ai-mobile`）和上游分支不是一回事**
>
> 这个分支把上游的**全部 AI 功能**和**整个桌面端**都删掉了，只留一个 **iOS / Android（Capacitor）移动端 App**。
> 如果你想要「AI 生成提示词、AI 调优提示词、桌面端 Electron 应用」，请用上游分支——本分支里没有，也不会加回来。

> ⚠️ **本项目是 [AI Gist](https://github.com/yarin-zhang/AI-Gist) 的 Fork**
>
> - 原作者：Yarin Zhang（[GitHub](https://github.com/yarin-zhang)），原项目采用 AGPL-3.0 许可证
> - 本 Fork 同样采用 AGPL-3.0 许可证，修改由 兔叽（[@msiya8160-star](https://github.com/msiya8160-star)）完成
> - 具体的修改范围与删除记录见 [NOTICE.md](./NOTICE.md)
> - 如果你通过网络（SaaS）方式提供基于本项目的服务，必须向用户公开修改后的完整源代码（AGPL-3.0 第 13 条）

---

<div align="center">

![Logo](docs/images/logo.png)

# AI Gist

![分支](https://img.shields.io/badge/分支-no--ai--mobile-orange?style=flat) ![平台](https://img.shields.io/badge/平台-iOS%20%7C%20Android-00A98F?style=flat&logo=capacitor&logoColor=white) ![数据存储](https://img.shields.io/badge/数据存储-100%25本地-success?style=flat&logo=database&logoColor=white) ![许可证](https://img.shields.io/badge/许可证-AGPL--3.0-lightgrey?style=flat)

**本地优先的移动端提示词与凭据管理应用。** 全部数据存在设备本地的 IndexedDB 里，不经过任何中间服务器。

上游原项目：<https://github.com/yarin-zhang/AI-Gist>

</div>

## 本分支和上游有什么区别

**不包含**（已删除，请勿在 Issue 里追问）：

- 所有 AI 功能：模型接入、AI 生成提示词、AI 调优 / 提示词优化工作台、AI 提取变量
- 变量的 Jinja / Nunjucks 模板引擎：`package.json` 里还留着 `nunjucks` 依赖，代码里的渲染分支也还在，但没有任何界面能开启它——现在只有 `{{变量}}` 的纯替换
- 桌面端（Electron + electron-builder）、桌面 Web 版（Docker）、本地 CLI
- App Store / Microsoft Store 发布、代码签名与公证流程
- iCloud 备份（`src/shared/types/cloud-backup.ts` 里 `icloud` 类型定义还在，本分支 UI 只提供 WebDAV）

**包含：**

- iOS / Android（Capacitor）移动端 App，构建链完整保留
- 提示词管理（变量填充、分类、标签、图片、收藏、搜索、排序）
- 凭据记录（账号 / URL / 密码）
- 本地备份与恢复、WebDAV 云端备份、多设备自动同步
- 多语言、深浅色主题、版本号规范

> 备份兼容性：用上游（带 AI 的版本）做过的备份导入本分支，数据不会丢，只是 AI 相关的表在当前版本没有任何界面可以读写。

## 这是什么

AI Gist 是一个本地优先的移动应用，用来管理你的**提示词模板**和**账号凭据**。默认完全离线，所有数据只写在本机 IndexedDB；只有你主动同步到 WebDAV 时才联网。

## 功能

**提示词与凭据**

- **双记录类型**：同一条记录可以是提示词（正文模板）或凭据（账号 / URL / 一条或多条密码）
- **变量填充**：在正文里写 `{{变量名}}`，使用时逐条填值再复制；变量支持文本 / 多行 / 下拉 / 数字 / 布尔五种类型，可设默认值、必填、校验规则
- **自动识别变量**：保存时从正文里自动挖出全部 `{{变量}}` 并生成变量定义，正文改动会同步增删对应变量
- **分类与标签**：分类支持在编辑页直接内联新建；标签支持搜索、常用标签推荐、按使用频次排序、多色标记
- **图片**：编辑页可加图片 / 截图（相机或相册）
- **收藏**：列表里单独筛「只看收藏」

**浏览与查找**

- **底部浮动导航**：两个 Tab（提示词 / 设置），提示词页多一条「新建提示词」入口条；下滑列表时导航自动收起，回到顶部展开
- **两种视图**：列表视图 / 瀑布流视图，顶部有切换开关，选择会记住
- **搜索与筛选**：全文搜索、顶部分类标签快速筛选、按标签筛选、只看收藏；按更新时间 / 创建时间 / 标题排序
- **无限滚动 + 下拉刷新**
- **详情页**：预览填充后的正文并复制；复制凭据可以按字段单独复制；改过的内容没保存会提示
- **删除有确认**（提示词、分类、备份都要手动确认）

**数据与同步**

- **本地备份**：导出完整数据包，导入时做完整性校验
- **云端备份**：WebDAV 云端上传 / 恢复 / 删除备份
- **多设备同步**：支持自动定时同步（可配间隔）或手动；冲突时选 merge 或 overwrite
- **自动备份**：可按设置自动导出本地备份
- **隐私**：数据只存在本机 IndexedDB，不经过任何中间服务器；只在主动同步 WebDAV 时联网

**多语言与外观**

- 简体中文、繁体中文、English、日本語、Italiano
- 深色 / 浅色 / 跟随系统
- 关于页显示当前版本，可检查 GitHub 上的最新 release

## 使用场景

- **写提示词**：模板里写 `{{角色}}`、`{{任务}}`、`{{输出格式}}`，保存后自动建好变量；下次用直接填值，一次复制
- **记凭据**：「新建」按钮选「凭据」类型，录下账号、地址和一条或多条密码，按字段单独复制
- **换设备**：设置 → 数据与同步，加一个 WebDAV 地址，开自动同步（或手动同步一次）
- **备份**：设置 → 数据备份 → 导出完整数据包，或上传到 WebDAV 云端备份

## 安装

本分支**不维护独立的 APK / IPA 发布**，从源码自己出包：`yarn build` 构建渲染层并同步 Capacitor，然后 `yarn cap:android` / `yarn cap:ios` 在 Android Studio / Xcode 里出包（命令见下节「开发」）。

也可以让 GitHub Actions 代跑，产物作为 draft release 上传（见下节「CI」）。

## 开发

### 开发环境

上游仓库没有把 `node` 和 `yarn` 装进 PATH，干净机器上直接敲 `yarn` 会提示找不到命令。实测可用（Windows + PowerShell）：

```powershell
# 1) 把 node 加进 PATH
$env:PATH = 'C:\app\DeepSeek Harness\resources\runtime\primary-runtime\dependencies\node\bin;' + $env:PATH
node -v          # v24.21.0

# 2) yarn 本身也不在 PATH，直接用 node 跑仓库里 vendored 的那一份
node .yarn/releases/yarn-4.9.2.cjs install
node .yarn/releases/yarn-4.9.2.cjs build

# 3) 之后每条命令都可以走 npm script：把 node_modules 下的 bin 目录挂上
$env:PATH = 'C:\app\DeepSeek Harness\AI-Gist-Tuji\node_modules\.bin;' + $env:PATH
yarn dev
```

注意 `package.json` 里 pin 了 `packageManager: "yarn@4.9.2"`，必须和 `.yarn/releases/yarn-4.9.2.cjs` 里 vendored 的版本一致；版本对不上时 corepack 会去联网下错版本。

**环境要求**：Node.js 22+（CI 用 22），yarn 4.9.2

```bash
yarn install                # 安装依赖
yarn dev                    # Vite 移动模式，浏览器里预览
yarn build                  # 构建渲染层到 build/renderer，然后 cap sync
yarn cap:android            # 用 Android Studio 打开 android/（打 APK/IPA 走这个）
yarn cap:ios                # 用 Xcode 打开 ios/（需 macOS + Xcode）
yarn cap:assets             # 从 resources/ 重新生成各平台图标尺寸
yarn test:run               # 跑一遍测试（43 个测试文件 / 424 个用例）
yarn test                   # 监听模式
yarn lint                   # ESLint
```

**版本号**：只改 `package.json` 里的 `version` 和 `buildRevision`，各平台构建号自动推导，不要手改 `build.gradle` / `project.pbxproj`。

```bash
yarn version:sync           # 把 package.json 的版本同步到原生工程
yarn version:check          # 校验（CI 里用）
```

**CI**：目前只有两条工作流，都只做移动端。

- Android：push 到 `mobile` 分支触发，出 debug / release 的 APK + AAB
- iOS：只能 `workflow_dispatch` 手动触发，要签名 secret

> 这两条工作流都没监听 `no-ai-mobile`。要在本分支自动构建，把 `.github/workflows/build-android-mobile.yml` 里的 `branches: [mobile]` 改成包含 `no-ai-mobile`，或者在 Actions 页面手动跑。

**参考文档**

- [移动端开发指南](./docs/mobile-development.md)
- [版本号与构建号规范](./docs/versioning.md)
- [移动端实现计划](./docs/mobile-implementation-plan.md)
- [移动端功能补全 PRD](./docs/plan/2026-05-05-移动端功能补全PRD.md)
- [设计 token 规则](./docs/AI_UI_DESIGN_PROMPT.md)（改 `src/renderer` 下的样式时用它的公共 token，别自建本地主题）

> `docs/project-architecture.md`、`docs/web-deployment-and-platform-differences.md`、`docs/github-actions.md` 讲的是上游桌面端 / Web 版，本分支不适用。`docs/images/` 里的截图也都属于上游界面。

## 贡献

提 Issue 或 PR 前先看一眼上面的「本分支和上游有什么区别」——**AI 相关功能不会在本分支加回来**，这类 Issue 会直接关闭。

修改范围与记录见 [NOTICE.md](./NOTICE.md)，协作约定见 [AGENTS.md](./AGENTS.md)。

## 许可证

本项目采用 [AGPL-3.0](./LICENSE)。

本项目是 [yarin-zhang/AI-Gist](https://github.com/yarin-zhang/AI-Gist) 的 Fork，在上游代码基础上修改。本分支同时删除了大量上游功能（全部 AI 能力、整个桌面端），删除记录见 [NOTICE.md](./NOTICE.md)。如果你通过网络（SaaS）方式提供基于本项目的服务，必须向用户公开修改后的完整源代码。
