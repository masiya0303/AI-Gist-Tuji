import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(process.cwd(), 'src/renderer/pages/mobile/MobileAIConfigEditPage.vue'),
  'utf8'
)

describe('移动端 AI 配置 API Key 输入同步', () => {
  it('从 ion-input 的宿主元素兜底同步自动填充的值', () => {
    expect(source).toContain('ref="apiKeyInputRef"')
    expect(source).toContain('@ionInput="syncApiKeyFromInput"')
    expect(source).toContain('@ionChange="syncApiKeyFromInput"')
    expect(source).toContain('@ionBlur="syncApiKeyFromInput"')
    // ion-input 是 Ionic 的 Vue 包装组件，值在 $el 上而不是 ref.value 上
    expect(source).toContain('apiKeyInputRef.value?.$el?.value')
  })

  it('测试连接和保存前都先同步，并去掉 Token 两端空白', () => {
    expect(source).toMatch(/handleTestConnection[\s\S]{0,1500}syncApiKeyFromInput\(\)/)
    expect(source).toMatch(/handleSave[\s\S]{0,1500}syncApiKeyFromInput\(\)/)
    expect(source).toContain('formData.apiKey.trim()')
    expect(source).toContain("apiKey: formData.apiKey.trim()")
  })

  it('测试连接按钮不因表单看起来不完整而提前禁用', () => {
    expect(source).toContain(':disabled="testingConnection"')
    expect(source).not.toContain('testingConnection || !canTestConnection')
  })
})
