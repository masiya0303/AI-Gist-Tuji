/**
 * Fork addition (AGPL v3.0 Section 5a):
 * Added by 兔叽 (msiya8160-star) on 2026-10-26
 * Purpose: native HTTP fallback for AI service requests on Capacitor builds.
 * Some OpenAI-compatible gateways (e.g. SenseNova https://token.sensenova.cn/v1)
 * answer CORS preflight (OPTIONS) with 404, so WKWebView / Android WebView
 * blocks the request before it is ever sent, even though the endpoint itself
 * works fine. When a WebView fetch fails at the network layer on a native
 * build, we retry once through CapacitorHttp, which bypasses WebView CORS
 * entirely. Web (dev:web) and Electron builds keep plain fetch semantics.
 * Original project: AI Gist by Yarin Zhang (https://github.com/yarin-zhang/AI-Gist)
 * This fork is licensed under AGPL-3.0
 */

import { Capacitor, CapacitorHttp } from '@capacitor/core'

/** 与 fetch Response 在调用点上等价的只读响应（native 兜底路径的产物） */
export interface NativeResponseShim {
  readonly ok: boolean
  readonly status: number
  readonly headers: { get(name: string): string | null }
  json(): Promise<any>
  text(): Promise<string>
}

/** fetchWithNativeFallback 的返回值：调用方只使用这些成员 */
export type HttpResponseLike = Response | NativeResponseShim

export interface NativeFallbackInit {
  method?: string
  headers?: Record<string, string>
  body?: string
  timeoutMs?: number
}

class NativeResponse implements NativeResponseShim {
  readonly ok: boolean
  readonly status: number
  private readonly headerMap: Map<string, string>
  private readonly bodyText: string

  constructor(status: number, headers: Record<string, string> | undefined, bodyText: string) {
    this.status = status
    this.ok = status >= 200 && status < 300
    this.headerMap = new Map(
      Object.entries(headers || {}).map(([name, value]) => [name.toLowerCase(), String(value)])
    )
    this.bodyText = bodyText
  }

  readonly headers = {
    get: (name: string): string | null => this.headerMap.get(name.toLowerCase()) ?? null
  }

  async json(): Promise<any> {
    return JSON.parse(this.bodyText)
  }

  async text(): Promise<string> {
    return this.bodyText
  }
}

/** 仅原生构建（Android / iOS）允许走原生兜底；Web 与 Electron 维持原行为 */
export function canUseNativeHttp(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

/**
 * 浏览器/WebView 对 CORS 预检失败、DNS 失败、连接被拒等网络层错误统一抛
 * TypeError（mobile-ai.service.ts 的 isNetworkLayerError 对此有详细说明）。
 */
export function isNetworkLayerError(error: unknown): boolean {
  return error instanceof TypeError
}

/** 单次原生请求；body 接受 JSON 字符串（对象自动解析，其他原样发送） */
export async function nativeHttpRequest(
  url: string,
  init: NativeFallbackInit
): Promise<NativeResponseShim> {
  const method = init.method || 'GET'
  let data: unknown
  if (init.body !== undefined) {
    try {
      data = JSON.parse(init.body)
    } catch {
      data = init.body
    }
  }

  const timeoutMs = init.timeoutMs || 20000
  const response = await CapacitorHttp.request({
    url,
    method,
    headers: init.headers || {},
    ...(data !== undefined ? { data } : {}),
    connectTimeout: timeoutMs,
    readTimeout: timeoutMs
  })

  const bodyText = typeof response.data === 'string'
    ? response.data
    : JSON.stringify(response.data ?? '')
  return new NativeResponse(response.status, response.headers, bodyText)
}

/**
 * 先走 WebView fetch（保持流式/CORS 原语义）；仅当网络层失败且当前是原生
 * 构建时，改用原生请求重试一次。原生路径没有 AbortSignal 支持，也不做
 * 流式——调用方拿到的是完整响应。
 */
export async function fetchWithNativeFallback(
  url: string,
  init: NativeFallbackInit = {}
): Promise<HttpResponseLike> {
  const method = init.method || 'GET'
  const timeoutMs = init.timeoutMs || 20000
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), timeoutMs)
  })

  try {
    return await Promise.race([
      fetch(url, {
        method,
        headers: init.headers,
        body: init.body,
        mode: 'cors',
        cache: 'no-cache'
      }),
      timeoutPromise
    ])
  } catch (error) {
    if (!isNetworkLayerError(error) || !canUseNativeHttp()) {
      throw error
    }
    console.warn('[NativeHttp] WebView 请求被拦截（疑似 CORS 预检失败），改用原生请求重试:', url)
    return await Promise.race([
      nativeHttpRequest(url, { ...init, method }),
      timeoutPromise
    ])
  }
}
