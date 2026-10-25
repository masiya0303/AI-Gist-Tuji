import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Prompt } from '../../src/shared/types'
import { getPromptDisplayTitle, parseCredentialData } from '../../src/renderer/lib/utils/prompt-display'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const EDIT_PAGE = 'src/renderer/pages/mobile/MobilePromptEditPage.vue'
const DETAIL_PAGE = 'src/renderer/pages/mobile/MobilePromptDetailPage.vue'

describe('移动端账号密码记录只填网站', () => {
  it('允许网站、账号、密码三选一，不再强制填写账号', () => {
    const source = read(EDIT_PAGE)

    expect(source).toContain('const hasUrl')
    expect(source).toContain('const hasPassword')
    expect(source).toContain('if (!account && !hasUrl && !hasPassword)')
    expect(source).toContain("t('promptManagement.credentialsRequired')")
  })

  it('详情页只渲染实际存在的字段，网站可以单独成行', () => {
    const source = read(DETAIL_PAGE)

    expect(source).toContain('v-if="hasAccount"')
    expect(source).toContain('v-if="credentialsUrl"')
    expect(source).toContain('v-if="hasPasswords"')
    expect(source).toContain('const hasAccount')
    expect(source).toContain('const hasPasswords')
  })

  it('只填网站且没有标题时用网站作为标题兜底', () => {
    const source = read(DETAIL_PAGE)

    expect(source).toContain('const promptHeading')
    expect(source).toContain("if (isCredentialsType.value && credentialsUrl.value) return credentialsUrl.value")
  })

  it('解析只含网站的 description，并在列表标题里使用网站', () => {
    const description = JSON.stringify({ passwords: [], url: 'https://example.com' })
    const data = parseCredentialData(description)

    expect(data.url).toBe('https://example.com')
    expect(data.passwords).toEqual([])

    const prompt = {
      title: '',
      content: '',
      description,
      type: 'credentials'
    } as Prompt

    expect(getPromptDisplayTitle(prompt)).toBe('https://example.com')
  })
})
