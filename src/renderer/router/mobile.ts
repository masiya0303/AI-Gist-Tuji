/**
 * Fork modification notice (AGPL v3.0 Section 5a):
 * Modified by 兔叽 (msiya8160-star) on 2026-10-21
 * Change: Added /category route for mobile category management page
 * Change: Added /category/:id route for the mobile category prompt drill-down page
 * Modified on 2026-10-26: 移除全部 AI 相关路由（AI 生成 / AI 优化 / AI 配置），
 *   本分支只保留提示词管理、分类、设置与云同步能力。
 * Original project: AI Gist by Yarin Zhang (https://github.com/yarin-zhang/AI-Gist)
 * This fork is licensed under AGPL-3.0
 */

import { createRouter, createWebHashHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/tabs/prompts'
  },
  {
    path: '/tabs',
    component: () => import('../pages/MobileMainPage.vue'),
    children: [
      {
        path: '',
        redirect: '/tabs/prompts'
      },
      {
        path: 'prompts',
        component: () => import('../pages/mobile/MobilePromptPage.vue')
      },
      {
        path: 'settings',
        component: () => import('../pages/mobile/MobileSettingsPage.vue')
      }
    ]
  },
  {
    // 分类提示词页：/category/12、/category/all、/category/uncategorized
    path: '/category/:id',
    component: () => import('../pages/mobile/MobileCategoryPromptPage.vue')
  },
  {
    path: '/prompt/create',
    component: () => import('../pages/mobile/MobilePromptEditPage.vue')
  },
  {
    path: '/prompt/edit/:id',
    component: () => import('../pages/mobile/MobilePromptEditPage.vue')
  },
  {
    path: '/prompt/detail/:id',
    component: () => import('../pages/mobile/MobilePromptDetailPage.vue')
  },
  // 设置二级页面：设置首页只做导航，具体设置都在这些独立页面里
  {
    path: '/mobile/settings/general',
    component: () => import('../pages/mobile/settings/MobileGeneralSettingsPage.vue')
  },
  {
    path: '/mobile/settings/data-sync',
    component: () => import('../pages/mobile/settings/MobileDataSyncPage.vue')
  },
  {
    path: '/mobile/settings/data-sync/storage/:id',
    component: () => import('../pages/mobile/settings/MobileStorageConfigPage.vue')
  },
  {
    path: '/mobile/settings/data-backup',
    component: () => import('../pages/mobile/settings/MobileDataBackupPage.vue')
  },
  {
    path: '/mobile/settings/data-backup/local',
    component: () => import('../pages/mobile/settings/MobileLocalBackupPage.vue')
  },
  {
    path: '/mobile/settings/data-backup/cloud/:storageId',
    component: () => import('../pages/mobile/settings/MobileCloudBackupPage.vue')
  },
  {
    // 旧入口（应用内深链和历史记录）继续可用
    path: '/mobile/cloud-backup',
    redirect: '/mobile/settings/data-sync'
  },
  {
    path: '/mobile/about',
    component: () => import('../pages/mobile/MobileAboutPage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
