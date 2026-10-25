<script setup lang="ts">
import { onMounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useTheme } from '~/composables/useTheme'
import { PlatformDetector } from '@shared/platform'
import MobileBackButtonHandler from '~/components/mobile/MobileBackButtonHandler.vue'

// 本分支只保留移动端：Ionic + Vue Router（见 router/mobile.ts）
const isNativeMobile = PlatformDetector.isMobile()

const { initTheme } = useTheme()

// 桌面、Web 与移动端共用同一套主题解析和 token 应用链路。
onMounted(async () => {
    try {
        await initTheme()
    } catch (error) {
        console.error('❌ [App] 主题初始化失败:', error)
    }
})
</script>

<template>
    <ion-app>
        <MobileBackButtonHandler v-if="isNativeMobile" />
        <ion-router-outlet />
    </ion-app>
</template>
