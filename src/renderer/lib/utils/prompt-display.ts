import type { Prompt } from '@shared/types'

export interface CredentialData {
  url: string
  passwords: string[]
}

const normalizePasswords = (values: unknown[]): string[] => values
  .map(value => (typeof value === 'string' ? value : String(value ?? '')))
  .filter(value => value.trim().length > 0)

/**
 * 解析账号密码类型提示词保存在 description 里的结构化数据。
 *
 * 兼容三种历史格式：
 * - { passwords: [...], url: "..." }
 * - ["password1", "password2"]
 * - 早期直接把单个密码写进 description 的纯文本
 */
export function parseCredentialData(description?: string): CredentialData {
  if (!description) return { url: '', passwords: [] }

  try {
    const parsed = JSON.parse(description)
    if (Array.isArray(parsed)) {
      return { url: '', passwords: normalizePasswords(parsed) }
    }
    if (parsed && typeof parsed === 'object') {
      return {
        url: typeof parsed.url === 'string' ? parsed.url.trim() : '',
        passwords: Array.isArray(parsed.passwords)
          ? normalizePasswords(parsed.passwords)
          : []
      }
    }
  } catch {
    // 不是 JSON，按单个密码处理
  }

  return { url: '', passwords: normalizePasswords([description]) }
}

/**
 * 列表 / 卡片标题的展示文案。
 *
 * 只填网站的账号密码记录通常没有标题和账号正文，这时用网站地址兜底，
 * 避免列表里显示成“暂无描述”或空白。
 */
export function getPromptDisplayTitle(prompt: Prompt, fallback = ''): string {
  const title = prompt.title?.trim()
  if (title) return title

  const content = prompt.content?.trim()
  if (content) {
    const firstLine = content.split('\n')[0].trim()
    return firstLine.length > 50 ? `${firstLine.slice(0, 50)}...` : firstLine
  }

  if (prompt.type === 'credentials') {
    const { url } = parseCredentialData(prompt.description)
    if (url) return url
  }

  return fallback
}
