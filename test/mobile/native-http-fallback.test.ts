/**
 * Fork addition (AGPL v3.0 Section 5a): 2026-10-26 by 兔叽 (msiya8160-star)
 * 原生 HTTP 兜底测试：覆盖「WebView fetch 网络层失败 → CapacitorHttp 原生重试」
 * 的触发条件、响应 shim 行为，以及生成器服务的非流式降级路径。
 * 背景：SenseNova（token.sensenova.cn）等网关对 CORS 预检返回 404，
 * WebView 在请求发出前就拦截（TypeError），移动端必须走原生请求绕过。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const capacitorMocks = vi.hoisted(() => ({
  isNativePlatform: vi.fn<[], boolean>(),
  request: vi.fn()
}))

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: capacitorMocks.isNativePlatform },
  CapacitorHttp: { request: capacitorMocks.request }
}))

import {
  fetchWithNativeFallback,
  isNetworkLayerError,
  nativeHttpRequest
} from '../../src/renderer/lib/services/native-http'
import { AIGeneratorService } from '../../src/renderer/lib/services/mobile-ai-generator.service'
import type { AIConfig } from '@shared/types/ai'

const fakeResponse = (overrides: Partial<{ ok: boolean; status: number }> = {}) => ({
  ok: overrides.ok ?? true,
  status: overrides.status ?? 200,
  headers: { get: () => null },
  json: async () => ({}),
  text: async () => ''
})

const makeConfig = (overrides: Partial<AIConfig> = {}): AIConfig => ({
  configId: 'config_native_test',
  name: 'SenseNova',
  type: 'openai',
  baseURL: 'https://token.sensenova.cn/v1',
  apiKey: 'sk-test',
  models: ['SenseNova-6.7'],
  defaultModel: 'SenseNova-6.7',
  enabled: true,
  isPreferred: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

describe('native-http 兜底判定', () => {
  it('TypeError 视为网络层错误，其他异常不算', () => {
    expect(isNetworkLayerError(new TypeError('Load failed'))).toBe(true)
    expect(isNetworkLayerError(new Error('请求超时'))).toBe(false)
  })
})

describe('fetchWithNativeFallback', () => {
  beforeEach(() => {
    capacitorMocks.isNativePlatform.mockReturnValue(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('WebView fetch 成功时不触发原生重试', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse())
    vi.stubGlobal('fetch', fetchMock)

    const response = await fetchWithNativeFallback('https://example.com/v1/models', {
      headers: { Authorization: 'Bearer sk-test' },
      timeoutMs: 5000
    })

    expect(response.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(capacitorMocks.request).not.toHaveBeenCalled()
  })

  it('HTTP 4xx/5xx 属于业务响应，不触发原生重试', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse({ ok: false, status: 401 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await fetchWithNativeFallback('https://example.com/v1/models', { timeoutMs: 5000 })

    expect(response.status).toBe(401)
    expect(capacitorMocks.request).not.toHaveBeenCalled()
  })

  it('网络层失败 + 原生构建时改用 CapacitorHttp，并返回等价响应', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Load failed')))
    capacitorMocks.request.mockResolvedValue({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      data: { data: [{ id: 'SenseNova-6.7' }] }
    })

    const response = await fetchWithNativeFallback('https://token.sensenova.cn/v1/models', {
      headers: { Authorization: 'Bearer sk-test' },
      timeoutMs: 5000
    })

    expect(response.ok).toBe(true)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json')
    await expect(response.json()).resolves.toEqual({ data: [{ id: 'SenseNova-6.7' }] })
    expect(capacitorMocks.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://token.sensenova.cn/v1/models',
        method: 'GET',
        headers: { Authorization: 'Bearer sk-test' }
      })
    )
  })

  it('网络层失败但非原生构建（Web/Electron）时原样抛错', async () => {
    capacitorMocks.isNativePlatform.mockReturnValue(false)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(
      fetchWithNativeFallback('https://token.sensenova.cn/v1/models', { timeoutMs: 5000 })
    ).rejects.toThrow(TypeError)
    expect(capacitorMocks.request).not.toHaveBeenCalled()
  })

  it('原生请求会解析 JSON 字符串 body 为对象', async () => {
    capacitorMocks.request.mockResolvedValue({ status: 200, headers: {}, data: { ok: true } })

    await nativeHttpRequest('https://example.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'm', messages: [] }),
      timeoutMs: 5000
    })

    expect(capacitorMocks.request).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { model: 'm', messages: [] },
        connectTimeout: 5000,
        readTimeout: 5000
      })
    )
  })
})

describe('生成器服务：WebView 失败时降级为原生非流式', () => {
  beforeEach(() => {
    capacitorMocks.isNativePlatform.mockReturnValue(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('generateChat 在 CORS 拦截后仍能通过原生请求拿到完整结果', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Load failed')))
    capacitorMocks.request.mockResolvedValue({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      data: { choices: [{ message: { content: '你好，世界' } }] }
    })

    const onProgress = vi.fn()
    const result = await AIGeneratorService.generateChat(
      makeConfig(),
      'SenseNova-6.7',
      '你是助手',
      '打个招呼',
      onProgress,
      { temperature: 0.4, maxTokens: 4000 }
    )

    expect(result.generatedPrompt).toBe('你好，世界')
    // 降级为非流式：onProgress 在拿到完整结果时一次性回调
    expect(onProgress).toHaveBeenCalledTimes(1)
    expect(onProgress).toHaveBeenCalledWith('你好，世界')

    const nativeArgs = capacitorMocks.request.mock.calls[0][0]
    expect(nativeArgs.url).toBe('https://token.sensenova.cn/v1/chat/completions')
    expect(nativeArgs.headers.Authorization).toBe('Bearer sk-test')
    // 原生路径不支持流式，body 不带 stream 字段
    expect(nativeArgs.data).toMatchObject({ model: 'SenseNova-6.7' })
    expect(nativeArgs.data.stream).toBeUndefined()
  })

  it('非原生构建不做降级，错误原样抛出', async () => {
    capacitorMocks.isNativePlatform.mockReturnValue(false)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(
      AIGeneratorService.generateChat(makeConfig(), 'SenseNova-6.7', 'sys', 'user')
    ).rejects.toThrow(TypeError)
    expect(capacitorMocks.request).not.toHaveBeenCalled()
  })

  it('原生请求返回错误状态时抛出带状态码的异常', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Load failed')))
    capacitorMocks.request.mockResolvedValue({
      status: 401,
      headers: {},
      data: { error: { message: 'Forbidden' } }
    })

    await expect(
      AIGeneratorService.generateChat(makeConfig(), 'SenseNova-6.7', 'sys', 'user')
    ).rejects.toThrow('API 调用失败: 401')
  })
})
