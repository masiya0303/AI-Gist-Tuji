<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>

      <!--
        提示词入口条 + 标签栏都放在 slot="bottom" 里，作为悬浮于内容之上的两片独立
        玻璃层（见 assets/styles/mobile.css 的 .mobile-floating-nav 分区），而不是
        贴死在屏幕底部的实体栏。标签栏本身在向下滚动时会收起为纯图标的小型胶囊。

        入口条只在「提示词」Tab 上出现，是「新建提示词」的长条主按钮。
        「设置」Tab 不再重复渲染独立的新建入口（Gitea issue #59）：这两个页面
        语境下点它既不能新建提示词，也没有直达价值，且 isPromptsTab 已经覆盖了
        全部 2 个 Tab 的判断，v-if 之外无需 v-else 兜底。入口条与标签栏共用同一套
        滚动收起动画：容器整体是 bottom: 0 的定位盒子，标签栏始终是最后一个子项，
        入口条是否渲染只影响它上方留白，不会让标签栏跟着挪位置或跳动。
      -->
      <div
        slot="bottom"
        class="mobile-floating-nav"
        :class="{ 'mobile-floating-nav--minimized': isNavMinimized }"
      >
        <button
          v-if="isPromptsTab"
          type="button"
          class="mobile-ai-entry"
          :aria-label="t('promptManagement.createPrompt')"
          @click="navigateToCreatePrompt"
        >
          <ion-icon :icon="add"></ion-icon>
          <span class="mobile-ai-entry__label">{{ t('promptManagement.createPrompt') }}</span>
        </button>

        <ion-tab-bar id="mobile-tab-bar">
          <ion-tab-button tab="prompts" href="/tabs/prompts">
            <ion-icon :icon="listOutline" />
            <ion-label>{{ t('mainPage.menu.prompts') }}</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="settings" href="/tabs/settings">
            <ion-icon :icon="settingsOutline" />
            <ion-label>{{ t('mainPage.menu.settings') }}</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </div>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet
} from '@ionic/vue'
import { add, listOutline, settingsOutline } from 'ionicons/icons'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '~/composables/useI18n'
import { shouldResetFloatingNav } from '~/lib/mobile/floating-nav-reset'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// ------------------------------------------------------------------
// 提示词操作区：单按钮布局
// 只在提示词 Tab 上生效；「设置」Tab 不渲染任何浮动入口按钮（Gitea issue #59）。
// ------------------------------------------------------------------
const isPromptsTab = computed(() => route.path === '/tabs/prompts')

const navigateToCreatePrompt = () => {
  router.push('/prompt/create')
}

// ------------------------------------------------------------------
// 滚动收起/展开浮动导航
// 各 Tab 根页面的 <ion-content scroll-events> 会派发 ionScroll 事件；该事件默认
// bubbles + composed，因此在这里用一个全局监听即可覆盖所有 Tab，无需逐页接线。
// ------------------------------------------------------------------
const isNavMinimized = ref(false)
const SCROLL_DELTA_THRESHOLD = 10
const SCROLL_TOP_RESTORE = 24
let lastScrollTop = 0

const handleIonScroll = (event: Event) => {
  const detail = (event as CustomEvent<{ scrollTop?: number }>).detail
  const scrollTop = detail?.scrollTop ?? 0
  const delta = scrollTop - lastScrollTop
  lastScrollTop = scrollTop

  if (scrollTop <= SCROLL_TOP_RESTORE) {
    isNavMinimized.value = false
  } else if (delta > SCROLL_DELTA_THRESHOLD) {
    isNavMinimized.value = true
  } else if (delta < -SCROLL_DELTA_THRESHOLD) {
    isNavMinimized.value = false
  }
}

onMounted(() => {
  document.addEventListener('ionScroll', handleIonScroll as EventListener)
})

onUnmounted(() => {
  document.removeEventListener('ionScroll', handleIonScroll as EventListener)
})

// 切换 Tab 时重置滚动基准并展开导航，避免带着上一个 Tab 的收起状态进入新页面。
//
// 必须只在「两个 Tab 之间互相切换」时才重置，不能在离开/返回 /tabs/* 之外的
// 二级页面（提示词详情、设置子页面等）时触发：MobileMainPage 导航到这类
// 二级页面时并不会被销毁，Ionic 的 ion-router-outlet 只是把它保留在页面栈
// 底层、盖上新页面，而这个 watch 挂在全局 route 对象上，离开 /tabs/* 时
// 同样会触发。旧写法不分青红皂白一律重置，会导致：提示词列表下滑到收起态
// -> 点进详情页（此时组件仍在后台挂载，isNavMinimized 被这里误重置为
// false，只是暂时被详情页盖住看不见）-> 返回列表页时浮动导航条先展开成
// 较宽状态，要等用户再滑动一下触发一次新的真实 ionScroll，才会被
// handleIonScroll 重新收起——列表实际滚动位置全程没变，只是这里的响应式
// 状态被提前清空了（对应 Gitea issue #88）。判断逻辑抽成纯函数
// shouldResetFloatingNav（见 lib/mobile/floating-nav-reset.ts），只有
// 新旧路径确实都落在 Tab 根路径下才重置；离开/返回二级页面时保留原有的
// 收起状态。
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (!shouldResetFloatingNav(oldPath, newPath)) {
      return
    }
    lastScrollTop = 0
    isNavMinimized.value = false
  }
)
</script>
