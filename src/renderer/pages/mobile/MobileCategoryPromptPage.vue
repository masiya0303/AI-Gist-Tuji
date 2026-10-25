<!--
  Fork addition (AGPL v3.0 Section 5a):
  Added by 兔叽 (msiya8160-star) on 2026-10-25
  Purpose: Mobile category prompt page opened from the two-column category cards
  on the prompts home page. Shows only the selected category's prompts as cards
  (with an optional list view), plus /all and /uncategorized variants.
  Original project: AI Gist by Yarin Zhang (https://github.com/yarin-zhang/AI-Gist)
  This fork is licensed under AGPL-3.0
-->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons v-if="!isSearchActive" slot="start">
          <ion-back-button default-href="/tabs/prompts"></ion-back-button>
        </ion-buttons>

        <ion-title v-if="!isSearchActive">{{ pageTitle }}</ion-title>

        <ion-searchbar
          v-else
          ref="searchbarRef"
          v-model="searchText"
          :placeholder="t('promptManagement.searchPrompt')"
          show-cancel-button="always"
          animated
          @ionInput="handleSearch"
          @ionClear="handleSearch"
          @ionCancel="closeSearch"
        ></ion-searchbar>

        <ion-buttons v-if="!isSearchActive" slot="end">
          <ion-button
            :aria-label="t('promptManagement.searchPrompt')"
            @click="openSearch"
          >
            <ion-icon :icon="searchOutline" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button
            v-if="!categoryMissing"
            :aria-label="t('promptManagement.createPrompt')"
            @click="handleCreate"
          >
            <ion-icon :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="ionContentRef" :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <p v-if="category?.description && !isSearchActive" class="category-description">
        {{ category.description }}
      </p>

      <div v-if="!loading && prompts.length > 0" class="mobile-list-toolbar">
        <span>{{ t('promptManagement.mobileResultCount', { count: totalCount }) }}</span>
        <ion-segment v-model="viewMode" class="view-mode-segment">
          <ion-segment-button value="list" :aria-label="t('promptManagement.viewModeList')">
            <ion-icon :icon="listOutline"></ion-icon>
          </ion-segment-button>
          <ion-segment-button value="waterfall" :aria-label="t('promptManagement.viewModeWaterfall')">
            <ion-icon :icon="gridOutline"></ion-icon>
          </ion-segment-button>
        </ion-segment>
      </div>

      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
      </div>

      <!-- 分类在打开本页后被删除（或路由里的 id 非法） -->
      <div v-else-if="categoryMissing" class="empty-container">
        <ion-icon :icon="folderOpenOutline" class="empty-icon"></ion-icon>
        <p class="empty-text">{{ t('promptManagement.categoryNotFound') }}</p>
        <ion-button fill="outline" @click="router.back()">
          {{ t('common.back') }}
        </ion-button>
      </div>

      <!-- 搜索无结果 -->
      <div v-else-if="prompts.length === 0 && searchText.trim()" class="empty-container">
        <NoSearchResultsIllustration />
        <p class="empty-text">{{ t('promptManagement.noSearchResults') }}</p>
        <p class="empty-description">{{ t('promptManagement.noSearchResultsDescription') }}</p>
        <ion-button fill="outline" @click="closeSearch">
          {{ t('promptManagement.clearSearchAndFilters') }}
        </ion-button>
      </div>

      <!-- 分类下没有提示词 -->
      <div v-else-if="prompts.length === 0" class="empty-container">
        <EmptyPromptsIllustration />
        <p class="empty-text">{{ t('promptManagement.noPrompts') }}</p>
        <p class="empty-description">{{ t('promptManagement.noPromptsDescription') }}</p>
        <ion-button @click="handleCreate">
          {{ t('promptManagement.create') }}
        </ion-button>
      </div>

      <!-- 列表视图 -->
      <div v-else-if="viewMode === 'list'" class="mobile-grouped-card">
        <ion-list>
          <ion-item-sliding v-for="prompt in prompts" :key="prompt.id">
            <ion-item button @click="handleView(prompt)">
              <ion-label>
                <h2 class="prompt-title">{{ prompt.title || getFirstLineOfContent(prompt.content) }}</h2>
                <p v-if="prompt.description && prompt.type === 'prompt'" class="prompt-description">
                  {{ prompt.description }}
                </p>
                <div class="prompt-meta">
                  <ion-chip
                    v-if="(isAll || isUncategorized) && prompt.categoryId"
                    size="small"
                    outline
                  >
                    <ion-label>{{ getCategoryName(prompt.categoryId) }}</ion-label>
                  </ion-chip>
                  <ion-chip v-for="tag in getTagsArray(prompt.tags).slice(0, 2)" :key="tag" size="small">
                    <ion-label>{{ tag }}</ion-label>
                  </ion-chip>
                  <ion-chip v-if="getTagsArray(prompt.tags).length > 2" size="small">
                    <ion-label>+{{ getTagsArray(prompt.tags).length - 2 }}</ion-label>
                  </ion-chip>
                </div>
              </ion-label>
              <ion-icon
                v-if="prompt.isFavorite"
                :icon="heart"
                slot="end"
                color="danger"
              ></ion-icon>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="primary" @click="handleEdit(prompt)">
                <ion-icon :icon="createOutline"></ion-icon>
                {{ t('common.edit') }}
              </ion-item-option>
              <ion-item-option color="danger" @click="handleDelete(prompt)">
                <ion-icon :icon="trashOutline"></ion-icon>
                {{ t('common.delete') }}
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </div>

      <!-- 卡片（瀑布流）视图：双列，与首页提示词卡片一致 -->
      <mobile-waterfall-view
        v-else
        :prompts="prompts"
        :categories="categoryList"
        @view="handleView"
      ></mobile-waterfall-view>

      <ion-infinite-scroll
        v-if="hasNextPage"
        @ionInfinite="loadMore"
        threshold="100px"
      >
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  alertController,
  onIonViewWillEnter
} from '@ionic/vue'
import {
  add,
  searchOutline,
  listOutline,
  gridOutline,
  heart,
  createOutline,
  trashOutline,
  folderOpenOutline
} from 'ionicons/icons'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '~/composables/useI18n'
import { api } from '~/lib/api'
import { presentMobileToast } from '~/lib/utils/mobile-toast'
import { getTagsArray } from '~/lib/utils/tag-colors'
import type { Category, Prompt } from '@shared/types'
import MobileWaterfallView from '~/components/mobile/MobileWaterfallView.vue'
import EmptyPromptsIllustration from '~/components/mobile/illustrations/EmptyPromptsIllustration.vue'
import NoSearchResultsIllustration from '~/components/mobile/illustrations/NoSearchResultsIllustration.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// ------------------------------------------------------------------
// 路由参数：数字 id = 普通分类，all = 全部提示词，uncategorized = 未分类
// ------------------------------------------------------------------
const routeParam = computed(() => String(route.params.id ?? ''))
const isAll = computed(() => routeParam.value === 'all')
const isUncategorized = computed(() => routeParam.value === 'uncategorized')
const numericCategoryId = computed<number | null>(() => {
  const parsed = Number(routeParam.value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
})
const invalidRoute = computed(() => {
  return !isAll.value && !isUncategorized.value && numericCategoryId.value === null
})

// 状态
const category = ref<Category | null>(null)
// 全部分类只用于给卡片/列表里的提示词补上分类名，避免“全部提示词”页丢失分类标签
const allCategories = ref<Category[]>([])
const categoryMissing = ref(false)
const prompts = ref<Prompt[]>([])
const loading = ref(true)
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = 20
const hasNextPage = ref(false)
const searchText = ref('')
const isSearchActive = ref(false)
const searchbarRef = ref<any>(null)
const ionContentRef = ref<any>(null)
const viewMode = ref<'list' | 'waterfall'>(
  (localStorage.getItem('mobileCategoryPromptViewMode') as 'list' | 'waterfall') || 'waterfall'
)

watch(viewMode, val => {
  localStorage.setItem('mobileCategoryPromptViewMode', val)
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
let promptLoadSequence = 0
let initialLoadPromise: Promise<void> | null = null
let hasEnteredOnce = false

// 具体分类页不需要在每张卡片上重复分类名；“全部/未分类”页才需要补标签
const categoryList = computed<Category[]>(() => {
  return isAll.value || isUncategorized.value ? allCategories.value : []
})

const pageTitle = computed(() => {
  if (isAll.value) return t('promptWorkspace.allPrompts')
  if (isUncategorized.value) return t('promptManagement.noCategory')
  return category.value?.name || t('promptManagement.categories')
})

// ------------------------------------------------------------------
// 数据加载
// ------------------------------------------------------------------
const loadCategory = async () => {
  categoryMissing.value = false

  // 基础分类列表一次拿齐：既用于确定当前分类，也让“全部/未分类”页的
  // 提示词卡片能显示所属分类名。
  try {
    allCategories.value = await api.categories.getBasic.query()
  } catch (error) {
    console.error('加载分类失败:', error)
    allCategories.value = []
    if (!isAll.value && !isUncategorized.value) {
      category.value = null
      categoryMissing.value = true
      return
    }
  }

  if (isAll.value || isUncategorized.value) {
    category.value = null
    return
  }

  if (invalidRoute.value || numericCategoryId.value === null) {
    category.value = null
    categoryMissing.value = true
    return
  }

  category.value = allCategories.value.find(item => item.id === numericCategoryId.value) || null
  categoryMissing.value = !category.value
}

const loadPrompts = async (append = false, options: { showLoading?: boolean } = {}) => {
  const showLoading = options.showLoading ?? true
  const loadId = ++promptLoadSequence

  if (!append) {
    currentPage.value = 1
    if (showLoading) {
      loading.value = true
    }
  }

  // 非法路由没有可查询的分类，直接落到“分类不存在”空状态
  if (invalidRoute.value) {
    prompts.value = []
    totalCount.value = 0
    hasNextPage.value = false
    loading.value = false
    return
  }

  try {
    const result = await api.prompts.getAll.query({
      page: currentPage.value,
      limit: pageSize,
      search: searchText.value.trim() || undefined,
      categoryId: isAll.value
        ? undefined
        : isUncategorized.value
          ? null
          : numericCategoryId.value ?? undefined,
      sortBy: 'updatedAt'
    })

    if (loadId !== promptLoadSequence) {
      return
    }

    if (append) {
      prompts.value = [...prompts.value, ...(result.data || [])]
    } else {
      prompts.value = result.data || []
    }
    hasNextPage.value = result.hasNextPage || false
    totalCount.value = result.total || 0
  } catch (error) {
    if (loadId !== promptLoadSequence) {
      return
    }
    console.error('加载分类提示词失败:', error)
    await showToast(t('promptManagement.loadFailed'), 'danger')
  } finally {
    if (loadId === promptLoadSequence && !append && showLoading) {
      loading.value = false
    }
  }
}

const loadAll = async (showLoading = false) => {
  // 先确定分类是否存在，再查提示词：避免分类已被删除时先闪一下“暂无提示词”
  await loadCategory()
  await loadPrompts(false, { showLoading })
}

// ------------------------------------------------------------------
// 搜索
// ------------------------------------------------------------------
const openSearch = async () => {
  isSearchActive.value = true
  await nextTick()
  await searchbarRef.value?.$el?.setFocus?.()
}

const closeSearch = () => {
  isSearchActive.value = false
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
  if (searchText.value) {
    searchText.value = ''
    loadPrompts(false, { showLoading: false })
  }
}

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    searchTimer = null
    loadPrompts(false, { showLoading: false })
  }, 260)
}

// ------------------------------------------------------------------
// 下拉刷新 / 加载更多
// ------------------------------------------------------------------
const handleRefresh = async (event: any) => {
  await loadAll(false)
  event.target.complete()
}

const loadMore = async (event: any) => {
  currentPage.value++
  await loadPrompts(true, { showLoading: false })
  event.target.complete()
}

// ------------------------------------------------------------------
// 提示词操作
// ------------------------------------------------------------------
const handleView = (prompt: Prompt) => {
  router.push(`/prompt/detail/${prompt.id}`)
}

const handleEdit = (prompt: Prompt) => {
  router.push(`/prompt/edit/${prompt.id}`)
}

const handleCreate = () => {
  const query = numericCategoryId.value !== null
    ? { categoryId: String(numericCategoryId.value) }
    : undefined
  router.push({ path: '/prompt/create', query })
}

const handleDelete = async (prompt: Prompt) => {
  const alert = await alertController.create({
    header: t('common.confirm'),
    message: t('promptManagement.confirmDeletePrompt', { title: prompt.title }),
    buttons: [
      {
        text: t('common.cancel'),
        role: 'cancel'
      },
      {
        text: t('common.delete'),
        role: 'destructive',
        handler: async () => {
          try {
            await api.prompts.delete.mutate(prompt.id!)
            await showToast(t('promptManagement.deleteSuccess'))
            await loadPrompts(false, { showLoading: false })
          } catch (error) {
            console.error('删除提示词失败:', error)
            await showToast(t('promptManagement.deleteFailed'), 'danger')
          }
        }
      }
    ]
  })

  await alert.present()
}

// ------------------------------------------------------------------
// 工具函数
// ------------------------------------------------------------------
const getCategoryName = (categoryId: number | null | undefined) => {
  if (categoryId == null) return t('promptManagement.noCategory')
  return allCategories.value.find(category => category.id === categoryId)?.name
    || t('promptManagement.noCategory')
}

const getFirstLineOfContent = (content: string | undefined) => {
  if (!content) return t('promptManagement.detailModal.noDescription')
  const firstLine = content.split('\n')[0].trim()
  return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
}

const showToast = async (message: string, color: string = 'success') => {
  await presentMobileToast(message, color)
}

// ------------------------------------------------------------------
// 生命周期
// ------------------------------------------------------------------
onMounted(() => {
  initialLoadPromise = loadAll(true).finally(() => {
    initialLoadPromise = null
  })
})

// 从提示词详情/编辑页返回时重新拉取，保证收藏、删除和编辑结果即时可见。
// 首次进入只负责标记 hasEnteredOnce，数据由 onMounted 的 initialLoadPromise
// 加载；这样无论 Ionic 的 viewWillEnter 与 Vue mounted 谁先触发都不会查两遍。
onIonViewWillEnter(() => {
  const isFirstEntry = !hasEnteredOnce
  hasEnteredOnce = true
  if (initialLoadPromise || isFirstEntry) return
  void loadAll(false)
})

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>

<style scoped>
/*
 * 搜索框展开态顶部间距：与 MobilePromptPage.vue 保持一致，详见该文件里的
 * 长注释。ion-toolbar 自动加上的 toolbar-searchbar 会清零上下 padding，
 * 这里补回一份固定在安全区之上的呼吸空间。
 */
ion-toolbar:first-of-type ion-searchbar {
  padding-top: var(--spacing-sm);
}

.category-description {
  margin: 0;
  padding: var(--spacing-sm) var(--mobile-page-gutter) 0;
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-footnote);
  line-height: var(--mobile-line-height-normal);
}

.mobile-list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 8px 16px;
  margin-bottom: 12px;
  color: var(--ion-color-medium);
  font-size: var(--mobile-font-size-footnote);
}

.view-mode-segment {
  flex: 0 0 auto;
  width: 84px;
  min-width: 84px;
}

.view-mode-segment ion-segment-button {
  --padding-start: 0;
  --padding-end: 0;
  min-width: 0;
  min-height: 30px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  color: var(--ion-color-medium);
  margin-bottom: var(--spacing-lg);
}

.empty-text {
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.prompt-description {
  color: var(--ion-color-medium);
  font-size: var(--mobile-font-size-footnote);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.prompt-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prompt-meta {
  margin-top: 8px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

ion-chip {
  margin: 0;
}

ion-content {
  --padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
}
</style>
