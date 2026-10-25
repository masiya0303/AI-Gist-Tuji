import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  buildEvaluationPrompt,
  buildIterationPrompt,
  buildOptimizationPrompt,
  cleanOptimizationResult,
  getMissingVariableNames,
  isOptimizationSupportedType,
  parseEvaluationResponse
} from '../../src/renderer/lib/prompt-optimization/templates'
import { countDiffRows, diffLines } from '../../src/renderer/lib/prompt-optimization/diff'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('移动端提示词优化工作台', () => {
  it('构建优化提示词时携带方向、变量和原始正文', () => {
    const pair = buildOptimizationPrompt({
      content: '请用 {{tone}} 语气介绍 {{topic}}',
      target: 'user',
      presetId: 'professional'
    })

    expect(pair.system).toContain('提示词优化专家')
    expect(pair.system).toContain('逐字保留')
    expect(pair.user).toContain('泛泛而谈')
    expect(pair.user).toContain('{{tone}}')
    expect(pair.user).toContain('{{topic}}')
    expect(pair.user).toContain(JSON.stringify('请用 {{tone}} 语气介绍 {{topic}}'))

    const systemPair = buildOptimizationPrompt({
      content: '你是一个客服助手',
      target: 'system',
      presetId: 'general'
    })
    expect(systemPair.user).toContain('系统提示词')
  })

  it('迭代提示词会带上上一轮结果和本轮要求', () => {
    const pair = buildIterationPrompt({
      originalContent: '原始 {{topic}}',
      previousResult: '上一轮 {{topic}}',
      instruction: '再精简一些',
      target: 'user'
    })

    expect(pair.user).toContain('再精简一些')
    expect(pair.user).toContain(JSON.stringify('上一轮 {{topic}}'))
    expect(pair.user).toContain(JSON.stringify('原始 {{topic}}'))
  })

  it('清理模型外壳但保留提示词正文', () => {
    expect(cleanOptimizationResult('```markdown\n优化后的提示词：\n请用 {{tone}} 介绍主题\n```'))
      .toBe('请用 {{tone}} 介绍主题')
    expect(cleanOptimizationResult('请直接输出这段正文')).toBe('请直接输出这段正文')
  })

  it('保留变量检查容忍空格差异，并能识别丢失', () => {
    expect(getMissingVariableNames('{{a}} {{b}}', '{{ a }} 和 {{b}}')).toEqual([])
    expect(getMissingVariableNames('{{a}} {{b}}', '{{a}}')).toEqual(['b'])
  })

  it('解析带代码块的评估 JSON，并校准分数和结论', () => {
    const raw = '```json\n' + JSON.stringify({
      originalScore: 61,
      optimizedScore: 88,
      verdict: 'better',
      dimensions: [
        { key: 'goalClarity', label: '目标清晰度', originalScore: 60, optimizedScore: 90 }
      ],
      summary: '更清晰了',
      improvements: ['补充输出示例', '']
    }) + '\n```'
    const parsed = parseEvaluationResponse(raw)

    expect(parsed).not.toBeNull()
    expect(parsed?.originalScore).toBe(61)
    expect(parsed?.optimizedScore).toBe(88)
    expect(parsed?.verdict).toBe('better')
    expect(parsed?.dimensions[0]).toMatchObject({
      key: 'goalClarity',
      originalScore: 60,
      optimizedScore: 90
    })
    expect(parsed?.improvements).toEqual(['补充输出示例'])
  })

  it('无法解析的评估返回 null，而不是抛错', () => {
    expect(parseEvaluationResponse('抱歉，我无法评估')).toBeNull()
    expect(parseEvaluationResponse('{}')).toBeNull()
  })

  it('评估提示词要求只返回 JSON', () => {
    const pair = buildEvaluationPrompt({
      original: '原版',
      optimized: '优化版',
      target: 'user',
      variables: ['topic']
    })

    expect(pair.system).toContain('只输出一个合法 JSON 对象')
    expect(pair.user).toContain('原版')
    expect(pair.user).toContain('优化版')
  })

  it('按行对比能区分新增、删除和相同行', () => {
    const rows = diffLines('a\nb\nc', 'a\nB\nc\nd')
    const stats = countDiffRows(rows)

    expect(rows.some(row => row.type === 'equal')).toBe(true)
    expect(rows.some(row => row.type === 'removed' && row.text === 'b')).toBe(true)
    expect(rows.some(row => row.type === 'added' && row.text === 'B')).toBe(true)
    expect(stats).toEqual({ added: 2, removed: 1 })
  })

  it('详情页和路由提供优化入口', () => {
    expect(read('src/renderer/pages/mobile/MobilePromptDetailPage.vue')).toContain('openOptimize')
    expect(read('src/renderer/pages/mobile/MobilePromptDetailPage.vue')).toContain('promptOptimization.optimizeAction')
    expect(read('src/renderer/router/mobile.ts')).toContain("path: '/prompt/optimize/:id'")
    expect(read('src/renderer/lib/services/mobile-ai-generator.service.ts')).toContain('static async generateChat')
    expect(read('src/renderer/lib/services/mobile-ai-generator.service.ts')).toContain('static stopChat')
  })

  it('优化支持的模型类型覆盖云端和本地兼容服务', () => {
    expect(isOptimizationSupportedType('openai')).toBe(true)
    expect(isOptimizationSupportedType('ollama')).toBe(true)
    expect(isOptimizationSupportedType('lmstudio')).toBe(true)
    expect(isOptimizationSupportedType('azure')).toBe(false)
  })
})
