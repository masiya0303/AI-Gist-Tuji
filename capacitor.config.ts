import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Fork modification notice (AGPL v3.0 Section 5a):
 * Modified by 兔叽 (msiya8160-star) on 2026-10-21
 * Change: appId changed from 'com.getaigist.app' to 'com.msiya8160.aigist'
 * Original project: AI Gist by Yarin Zhang (https://github.com/yarin-zhang/AI-Gist)
 */
const config: CapacitorConfig = {
  appId: 'com.msiya8160.aigist',
  appName: 'AI Gist',
  webDir: 'build/renderer',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,   // 由代码手动调用 SplashScreen.hide() 控制隐藏时机
      fadeOutDuration: 300,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
