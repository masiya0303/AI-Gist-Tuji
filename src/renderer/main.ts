import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import { initDatabase, cloudSyncService, automaticBackupService } from './lib/services'
import { applyDocumentLocale, resolveInitialLocale } from './i18n/locale-detection'
import { PlatformDetector } from '@shared/platform'
import './assets/scss/index.scss'
import { setupMobileDebug } from './utils/mobile-debug'
import { applyDocumentTheme, getSystemThemePreference, resolveTheme, type ThemeSource } from './theme/runtime'

// 本分支只保留移动端壳
document.documentElement.classList.add('mobile-shell')
setupMobileDebug()

// 初始化语言设置
function initLocale() {
  const locale = resolveInitialLocale()
  i18n.global.locale.value = locale
  applyDocumentLocale(locale)
  console.log(`应用语言设置: ${locale}`)
}

// 预设初始主题类，避免闪烁
function setInitialTheme() {
  const savedTheme = localStorage.getItem('theme') as ThemeSource | null
  const source = savedTheme && ['system', 'light', 'dark'].includes(savedTheme) ? savedTheme : 'system'
  applyDocumentTheme(
    resolveTheme(source, getSystemThemePreference()),
    'mobile'
  )
}

// 移除初始加载屏幕（同时隐藏原生 SplashScreen）
async function removeInitialLoading() {
  if (PlatformDetector.isMobile()) {
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen')
      await SplashScreen.hide({ fadeOutDuration: 300 })
    } catch (e) {
      console.warn('[Main] SplashScreen.hide 失败:', e)
    }
  }

  const loadingElement = document.getElementById('initial-loading')
  if (loadingElement) {
    loadingElement.classList.add('loading-hidden')
    setTimeout(() => {
      if (loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement)
      }
    }, 300) // 等待淡出动画完成
  }
}

// 注册移动端路由与 Ionic
async function registerMobileApp(app: import('vue').App) {
  const { setupIonic } = await import('./setup-ionic')
  setupIonic(app)

  const mobileRouter = await import('./router/mobile')
  app.use(mobileRouter.default)
  await mobileRouter.default.isReady()

  if (PlatformDetector.isMobile()) {
    // 激活 Capacitor 返回键桥接
    // AppPlugin.java 中 hasListeners = true 后，native 才会触发 backbutton DOM 事件，
    // 进而被 Ionic 的 startHardwareBackButton() 接管并派发 ionBackButton 事件
    const { App: CapApp } = await import('@capacitor/app')
    CapApp.addListener('backButton', () => { /* 由 Ionic 事件系统统一处理 */ })
  }
}

// 初始化数据库，然后启动应用
async function startApp() {
  try {
    // 立即设置初始主题和语言
    setInitialTheme()
    initLocale()

    await initDatabase()
    console.log('IndexedDB initialized successfully')

    const app = createApp(App)
    app.use(i18n)

    await registerMobileApp(app)

    app.mount('#app')

    await cloudSyncService.startAutoSyncFromSettings({
      platform: PlatformDetector.getPlatform(),
      deviceName: navigator.userAgent,
      startupDelayMs: PlatformDetector.isMobile() ? 0 : undefined
    })
    await automaticBackupService.startFromSettings()

    if (PlatformDetector.isMobile()) {
      const { App: CapApp } = await import('@capacitor/app')
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          cloudSyncService.scheduleSync('resume', { delayMs: 0 })
        } else {
          const backupFlush = automaticBackupService.flushPendingBackup({ reason: 'background', timeoutMs: 3000 })
          const syncFlush = cloudSyncService.flushPendingSync({ reason: 'background', timeoutMs: 3000 })
          void Promise.allSettled([backupFlush, syncFlush])
        }
      })
    }

    // Vue 应用挂载完成后移除加载屏幕
    removeInitialLoading()
  } catch (error) {
    console.error('Failed to initialize database:', error)
    // 即使数据库初始化失败，也要启动应用
    const app = createApp(App)
    app.use(i18n)
    await registerMobileApp(app)
    app.mount('#app')
    removeInitialLoading()
  }
}

startApp()
