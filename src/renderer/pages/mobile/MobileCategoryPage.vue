<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="t('common.back')" default-href="/tabs/prompts"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ t('promptManagement.categoryManageTitle') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="startCreating">
            <ion-icon :icon="add" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- 空状态 -->
      <div v-if="!loading && categories.length === 0" class="empty-state">
        <ion-icon :icon="albumsOutline" class="empty-icon"></ion-icon>
        <p class="empty-title">{{ t('promptManagement.noCategories') }}</p>
        <p class="empty-desc">{{ t('promptManagement.noCategoriesDesc') }}</p>
        <ion-button @click="startCreating" class="empty-btn">
          <ion-icon :icon="add" slot="start"></ion-icon>
          {{ t('promptManagement.createCategory') }}
        </ion-button>
      </div>

      <!-- 创建表单 -->
      <div v-if="isCreating" class="category-form">
        <ion-item>
          <ion-input
            v-model="newCategory.name"
            :label="t('promptManagement.categoryName')"
            :placeholder="t('promptManagement.categoryNamePlaceholder')"
            clear-button
            @keyup.enter="handleCreate"
          />
        </ion-item>
        <ion-item>
          <ion-input
            v-model="newCategory.description"
            :label="t('promptManagement.categoryDescription')"
            :placeholder="t('promptManagement.categoryDescriptionPlaceholder')"
            clear-button
            @keyup.enter="handleCreate"
          />
        </ion-item>
        <ion-item>
          <ion-label>{{ t('promptManagement.color') }}</ion-label>
          <div class="color-picker-row">
            <button
              v-for="color in COLOR_OPTIONS"
              :key="color"
              type="button"
              class="color-option"
              :class="{ selected: newCategory.color === color }"
              :style="{ backgroundColor: color }"
              :aria-label="color"
              @click="newCategory.color = color"
            />
          </div>
        </ion-item>
        <div class="form-actions">
          <ion-button expand="block" :loading="creating" @click="handleCreate">
            {{ t('promptManagement.createCategory') }}
          </ion-button>
          <ion-button expand="block" fill="outline" @click="cancelCreating">
            {{ t('common.cancel') }}
          </ion-button>
        </div>
      </div>

      <!-- 分类列表 -->
      <ion-list v-if="!loading && categories.length > 0 && !isCreating">
        <ion-list-header>
          <ion-label class="list-title">
            {{ t('promptManagement.totalCategories', { count: categories.length }) }}
          </ion-label>
        </ion-list-header>

        <ion-item
          v-for="category in categories"
          :key="category.id"
          class="category-item"
        >
          <ion-note slot="start" class="color-dot" :style="{ backgroundColor: category.color || '#67c23a' }">
          </ion-note>
          <ion-label>
            <span class="category-name">{{ category.name }}</span>
            <span v-if="category.description" class="category-desc">{{ category.description }}</span>
          </ion-label>
          <ion-note slot="end" class="category-count">
            {{ category.prompts?.length || 0 }} {{ t('promptManagement.prompts') }}
          </ion-note>
          <ion-buttons slot="end">
            <ion-button @click="editCategory(category)">
              <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
            </ion-button>
            <ion-button @click="deleteCategory(category)">
              <ion-icon :icon="trashOutline" slot="icon-only" color="danger"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>
      </ion-list>

      <!-- 编辑弹窗 -->
      <ion-modal :is-open="editingCategory !== null" @ionDismiss="cancelEdit">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="cancelEdit">
                <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-buttons>
            <ion-title>{{ t('promptManagement.editCategory') }}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div v-if="editingCategory" class="category-form">
            <ion-item>
              <ion-input
                v-model="editingCategory.name"
                :label="t('promptManagement.categoryName')"
                :placeholder="t('promptManagement.categoryNamePlaceholder')"
                clear-button
              />
            </ion-item>
            <ion-item>
              <ion-input
                v-model="editingCategory.description"
                :label="t('promptManagement.categoryDescription')"
                :placeholder="t('promptManagement.categoryDescriptionPlaceholder')"
                clear-button
              />
            </ion-item>
            <ion-item>
              <ion-label>{{ t('promptManagement.color') }}</ion-label>
              <div class="color-picker-row">
                <button
                  v-for="color in COLOR_OPTIONS"
                  :key="color"
                  type="button"
                  class="color-option"
                  :class="{ selected: editingCategory.color === color }"
                  :style="{ backgroundColor: color }"
                  :aria-label="color"
                  @click="editingCategory.color = color"
                />
              </div>
            </ion-item>
            <div class="form-actions">
              <ion-button expand="block" :loading="updating" @click="handleSaveEdit">
                {{ t('common.save') }}
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- 删除确认弹窗 -->
      <ion-modal :is-open="deletingCategory !== null" @ionDismiss="cancelDelete">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ t('promptManagement.deleteCategoryTitle') }}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div v-if="deletingCategory" class="delete-confirm">
            <p>
              {{ t('promptManagement.deleteCategoryConfirm', { name: deletingCategory.name, count: deletingCategory.prompts?.length || 0 }) }}
            </p>
            <div class="form-actions">
              <ion-button expand="block" color="danger" :loading="deleting" @click="handleDelete">
                {{ t('promptManagement.deleteCategory') }}
              </ion-button>
              <ion-button expand="block" fill="outline" @click="cancelDelete">
                {{ t('common.cancel') }}
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonContent,
  IonList,
  IonListItem,
  IonListHeader,
  IonLabel,
  IonInput,
  IonNote,
  IonIcon,
  IonModal,
  IonSpinner,
  presentAlert,
  presentToast
} from '@ionic/vue'
import {
  add,
  closeOutline,
  createOutline,
  trashOutline,
  albumsOutline
} from 'ionicons/icons'
import { CategoryService } from '~/lib/services/category.service'
import type { Category, CategoryWithRelations } from '@shared/types/database'

const { t } = useI18n()
const router = useRouter()

const COLOR_OPTIONS = [
  '#67c23a', // 绿色
  '#409eff', // 蓝色
  '#e6a23c', // 橙色
  '#f56c6c', // 红色
  '#909399', // 灰色
  '#8b5cf6', // 紫色
  '#06b6d4', // 青色
  '#ec4899'  // 粉色
]

const categories = ref<CategoryWithRelations[]>([])
const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const deleting = ref(false)
const isCreating = ref(false)
const editingCategory = ref<Category | null>(null)
const deletingCategory = ref<CategoryWithRelations | null>(null)

const newCategory = ref({
  name: '',
  description: '',
  color: COLOR_OPTIONS[0],
  isActive: true
})

const loadCategories = async () => {
  loading.value = true
  try {
    const service = CategoryService.getInstance()
    categories.value = await service.getAllCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
    await presentToast({
      message: t('common.loadFailed'),
      color: 'danger',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}

const startCreating = () => {
  isCreating.value = true
  newCategory.value = {
    name: '',
    description: '',
    color: COLOR_OPTIONS[0],
    isActive: true
  }
}

const cancelCreating = () => {
  isCreating.value = false
}

const handleCreate = async () => {
  if (!newCategory.value.name.trim()) {
    await presentAlert({
      header: t('common.validationError'),
      message: t('promptManagement.categoryNameRequired'),
      buttons: [t('common.ok')]
    })
    return
  }

  creating.value = true
  try {
    const service = CategoryService.getInstance()
    await service.createCategory(newCategory.value)
    await presentToast({
      message: t('promptManagement.categoryCreated'),
      color: 'success',
      duration: 2000
    })
    cancelCreating()
    await loadCategories()
  } catch (error) {
    console.error('创建分类失败:', error)
    await presentToast({
      message: t('promptManagement.createCategoryFailed'),
      color: 'danger',
      duration: 3000
    })
  } finally {
    creating.value = false
  }
}

const editCategory = (category: CategoryWithRelations) => {
  editingCategory.value = {
    id: category.id,
    uuid: category.uuid,
    name: category.name,
    description: category.description,
    color: category.color || COLOR_OPTIONS[0],
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  }
}

const cancelEdit = () => {
  editingCategory.value = null
}

const handleSaveEdit = async () => {
  if (!editingCategory.value) return

  if (!editingCategory.value.name.trim()) {
    await presentAlert({
      header: t('common.validationError'),
      message: t('promptManagement.categoryNameRequired'),
      buttons: [t('common.ok')]
    })
    return
  }

  updating.value = true
  try {
    const service = CategoryService.getInstance()
    await service.updateCategory(editingCategory.value.id!, {
      name: editingCategory.value.name,
      description: editingCategory.value.description,
      color: editingCategory.value.color
    })
    await presentToast({
      message: t('promptManagement.categoryUpdated'),
      color: 'success',
      duration: 2000
    })
    cancelEdit()
    await loadCategories()
  } catch (error) {
    console.error('更新分类失败:', error)
    await presentToast({
      message: t('promptManagement.updateCategoryFailed'),
      color: 'danger',
      duration: 3000
    })
  } finally {
    updating.value = false
  }
}

const deleteCategory = (category: CategoryWithRelations) => {
  deletingCategory.value = category
}

const cancelDelete = () => {
  deletingCategory.value = null
}

const handleDelete = async () => {
  if (!deletingCategory.value) return

  deleting.value = true
  try {
    const service = CategoryService.getInstance()
    await service.deleteCategory(deletingCategory.value.id!)
    await presentToast({
      message: t('promptManagement.categoryDeleted'),
      color: 'success',
      duration: 2000
    })
    cancelDelete()
    await loadCategories()
  } catch (error) {
    console.error('删除分类失败:', error)
    await presentToast({
      message: t('promptManagement.deleteCategoryFailed'),
      color: 'danger',
      duration: 3000
    })
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0 0 24px 0;
}

.empty-btn {
  width: 100%;
  max-width: 300px;
}

.category-form {
  padding: 16px;
}

.color-picker-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 0;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: var(--ion-color-primary);
  transform: scale(1.15);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.list-title {
  font-size: 14px;
  font-weight: 500;
}

.category-item {
  padding: 12px 16px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  display: block;
}

.category-desc {
  font-size: 13px;
  color: var(--ion-color-medium);
  display: block;
  margin-top: 4px;
}

.category-count {
  font-size: 13px;
  color: var(--ion-color-medium);
}

.delete-confirm {
  padding: 32px 24px;
  text-align: center;
}

.delete-confirm p {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 24px 0;
}
</style>
