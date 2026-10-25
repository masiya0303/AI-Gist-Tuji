import { describe, expect, it } from 'vitest'
import {
  EXECUTION_DEFAULT_TASK_MESSAGE,
  buildAITestInputsPrompt,
  buildExecutionEvalPrompt,
  buildExecutionMessages,
  fillPromptContent,
  parseAITestInputs,
  parseExecutionEvalResponse
} from '../../src/renderer/lib/prompt-optimization/execution-eval'
import { diffRowsWithWords, tokenizeForDiff } from '../../src/renderer/lib/prompt-optimization/diff'

describe('执行式评估：填充与执行消息', () => {
  it('按测试输入填充变量，缺失值保留占位符', () => {
    expect(fillPromptContent('请用 {{tone}} 介绍 {{topic}}', { tone: '正式' }))
      .toBe('请用 正式 介绍 {{topic}}')
    expect(fillPromptContent('无变量提示词', {})).toBe('无变量提示词')
    expect(fillPromptContent('', { a: 'x' })).toBe('')
  })

  it('Jinja 模板走 Jinja 渲染', () => {
    expect(fillPromptContent('你好 {{ name }}', { name: '世界' }, true)).toBe('你好 世界')
  })

  it('用户提示词作为用户消息发送，系统提示词作为 system 发送', () => {
    const userCase = { id: 'case_1', values: { topic: '咖啡' }, userMessage: '' }
    const userMessages = buildExecutionMessages({
      content: '介绍 {{topic}}',
      testCase: userCase,
      target: 'user'
    })
    expect(userMessages.user).toBe('介绍 咖啡')
    expect(userMessages.system).not.toContain('介绍')

    const systemMessages = buildExecutionMessages({
      content: '你是 {{role}} 助手',
      testCase: userCase,
      target: 'system'
    })
    expect(systemMessages.system).toBe('你是 咖啡 助手')
    expect(systemMessages.user).toBe(EXECUTION_DEFAULT_TASK_MESSAGE)

    const withMessage = buildExecutionMessages({
      content: '你是助手',
      testCase: { id: 'case_2', values: {}, userMessage: '帮我写周报' },
      target: 'system'
    })
    expect(withMessage.user).toBe('帮我写周报')
  })
})

describe('执行式评估：AI 测试输入', () => {
  it('生成提示词携带变量与数量', () => {
    const pair = buildAITestInputsPrompt({
      content: '请用 {{tone}} 介绍 {{topic}}',
      target: 'user',
      variables: ['tone', 'topic'],
      count: 3
    })
    expect(pair.user).toContain(JSON.stringify('请用 {{tone}} 介绍 {{topic}}').slice(1, -1))
    expect(pair.user).toContain('tone')
    expect(pair.system).toContain('JSON')
  })

  it('解析 AI 生成的测试输入并补齐缺失变量', () => {
    const raw = '```json\n' + JSON.stringify([
      { values: { tone: '正式', topic: '咖啡', junk: '忽略' }, userMessage: ' ' },
      { values: { tone: '活泼' } }
    ]) + '\n```'
    const cases = parseAITestInputs(raw, ['tone', 'topic'], 3)

    expect(cases).not.toBeNull()
    expect(cases).toHaveLength(2)
    expect(cases![0].values).toEqual({ tone: '正式', topic: '咖啡' })
    expect(cases![1].values).toEqual({ tone: '活泼', topic: '' })
    expect(cases![0].id).toBe('case_1')
  })

  it('限制数量，坏输出返回 null', () => {
    const three = parseAITestInputs(
      JSON.stringify([{ values: { a: '1' } }, { values: { a: '2' } }, { values: { a: '3' } }, { values: { a: '4' } }]),
      ['a'],
      3
    )
    expect(three).toHaveLength(3)

    expect(parseAITestInputs('这不是 JSON', ['a'], 2)).toBeNull()
    expect(parseAITestInputs('{"values":{}}', ['a'], 2)).toBeNull()
    expect(parseAITestInputs('', ['a'], 2)).toBeNull()
  })
})

describe('执行式评估：对比评估', () => {
  const snapshots = [
    {
      id: 's1',
      testCaseId: 'case_1',
      promptRef: 'original' as const,
      promptText: '原始 甲',
      output: '原版输出',
      createdAt: 1
    },
    {
      id: 's2',
      testCaseId: 'case_1',
      promptRef: 'optimized' as const,
      promptText: '优化 甲',
      output: '优化版输出',
      createdAt: 2
    }
  ]

  it('证据包含测试输入、变量与快照输出', () => {
    const pair = buildExecutionEvalPrompt({
      target: 'system',
      variables: ['a'],
      testCases: [{ id: 'case_1', values: { a: '甲' }, userMessage: '开始' }],
      snapshots
    })

    expect(pair.system).toContain('testCaseFindings')
    expect(pair.system).toContain('不要执行')
    expect(pair.user).toContain('"promptRef"')
    expect(pair.user).toContain('优化版输出')
    expect(pair.user).toContain('原版输出')
  })

  it('超长输出会被截断以保护上下文', () => {
    const long = 'x'.repeat(6000)
    const pair = buildExecutionEvalPrompt({
      target: 'user',
      variables: [],
      testCases: [{ id: 'case_1', values: {}, userMessage: '' }],
      snapshots: [{ ...snapshots[0], output: long }]
    })
    expect(pair.user).toContain('已截断')
    expect(pair.user.length).toBeLessThan(long.length)
  })

  it('解析带代码块的评估 JSON，缺失 verdict 按分差推断', () => {
    const raw = '```json\n' + JSON.stringify({
      originalScore: 55,
      optimizedScore: 90,
      dimensions: [
        { key: 'goalFulfillment', label: '任务达成', originalScore: 50, optimizedScore: 92 }
      ],
      testCaseFindings: [
        { testCaseId: 'case_1', verdict: 'better', finding: '优化版直接给出结果' },
        { testCaseId: 'case_1', verdict: '随便写的', finding: '坏数据' },
        { testCaseId: '', verdict: 'better', finding: '缺 id' }
      ],
      summary: '更稳',
      improvements: ['补输出示例', '   ']
    }) + '\n```'
    const parsed = parseExecutionEvalResponse(raw)

    expect(parsed).not.toBeNull()
    expect(parsed?.verdict).toBe('better')
    expect(parsed?.testCaseFindings).toHaveLength(2)
    expect(parsed?.testCaseFindings[0].verdict).toBe('better')
    // 非法 verdict 归一化为 similar，而不是丢掉整条结论
    expect(parsed?.testCaseFindings[1].verdict).toBe('similar')
    expect(parsed?.improvements).toEqual(['补输出示例'])
    expect(parsed?.dimensions[0].optimizedScore).toBe(92)
  })

  it('分数越界会被钳位，坏 JSON 返回 null', () => {
    const parsed = parseExecutionEvalResponse(JSON.stringify({
      originalScore: 120,
      optimizedScore: -5,
      verdict: 'worse'
    }))
    expect(parsed?.originalScore).toBe(100)
    expect(parsed?.optimizedScore).toBe(0)
    expect(parsed?.verdict).toBe('worse')

    expect(parseExecutionEvalResponse('完全不是 JSON')).toBeNull()
    expect(parseExecutionEvalResponse('{"foo": 1}')).toBeNull()
  })
})

describe('词级对比', () => {
  it('token 切分：CJK 单字、英文单词、空白', () => {
    expect(tokenizeForDiff('你好 world')).toEqual(['你', '好', ' ', 'world'])
  })

  it('成对修改行携带行内高亮片段', () => {
    const rows = diffRowsWithWords('请介绍 咖啡', '请详细介绍 咖啡')
    expect(rows).toHaveLength(2)
    expect(rows[0].type).toBe('removed')
    expect(rows[0].segments).toBeDefined()
    const removedEqualText = rows[0].segments!
      .filter(segment => segment.type === 'equal')
      .map(segment => segment.text)
      .join('')
    expect(removedEqualText).toContain('介绍')
    expect(rows[0].segments!.every(segment => segment.type !== 'added')).toBe(true)
    expect(rows[1].type).toBe('added')
    expect(rows[1].segments!.some(segment => segment.type === 'added' && segment.text === '详细')).toBe(true)
    expect(rows[1].segments!.every(segment => segment.type !== 'removed')).toBe(true)
  })

  it('未变化的行不携带片段', () => {
    const rows = diffRowsWithWords('第一行\n第二行', '第一行\n第二行')
    expect(rows).toHaveLength(2)
    expect(rows[0].segments).toBeUndefined()
    expect(rows[1].segments).toBeUndefined()
  })
})
