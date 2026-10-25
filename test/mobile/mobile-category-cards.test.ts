import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const HOME = 'src/renderer/pages/mobile/MobilePromptPage.vue'
const CATEGORY_PAGE = 'src/renderer/pages/mobile/MobileCategoryPromptPage.vue'
const ROUTER = 'src/renderer/router/mobile.ts'

describe('移动端分类卡片首页', () => {
  it('把分类渲染成双列卡片，并提供全部提示词入口', () => {
    const home = read(HOME)

    expect(home).toContain('class="category-card-grid"')
    expect(home).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(home).toContain('@click="openCategory(category)"')
    expect(home).toContain('@click="openAllPrompts"')
    expect(home).toContain('@click="openUncategorized"')
  })

  it('点开分类后进入独立的分类提示词页', () => {
    const router = read(ROUTER)
    const page = read(CATEGORY_PAGE)

    expect(router).toContain("path: '/category/:id'")
    expect(page).toContain('categoryId: isAll.value')
    expect(page).toContain('isUncategorized.value')
    expect(page).toContain('<mobile-waterfall-view')
    expect(page).toContain('viewMode')
  })

  it('分类页支持全部提示词与未分类两个特殊入口', () => {
    const home = read(HOME)

    expect(home).toContain("router.push('/category/all')")
    expect(home).toContain("router.push('/category/uncategorized')")
  })
})
