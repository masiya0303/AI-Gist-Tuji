export type DiffRowType = 'equal' | 'added' | 'removed'

export interface DiffRow {
  type: DiffRowType
  text: string
}

/**
 * 按行做 LCS 对比，供移动端优化工作台的“对比”页使用。
 *
 * 不引入额外 diff 依赖：提示词通常是几十到几百行，O(n*m) 的 DP 足够，
 * 用 Uint16Array 控制内存占用。
 */
export function diffLines(original: string, optimized: string): DiffRow[] {
  const before = original.split('\n')
  const after = optimized.split('\n')
  const beforeLength = before.length
  const afterLength = after.length

  const table = Array.from(
    { length: beforeLength + 1 },
    () => new Uint16Array(afterLength + 1)
  )

  for (let i = beforeLength - 1; i >= 0; i -= 1) {
    const row = table[i]
    const nextRow = table[i + 1]
    for (let j = afterLength - 1; j >= 0; j -= 1) {
      row[j] = before[i] === after[j]
        ? nextRow[j + 1] + 1
        : Math.max(nextRow[j], row[j + 1])
    }
  }

  const rows: DiffRow[] = []
  let i = 0
  let j = 0

  while (i < beforeLength && j < afterLength) {
    if (before[i] === after[j]) {
      rows.push({ type: 'equal', text: before[i] })
      i += 1
      j += 1
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      rows.push({ type: 'removed', text: before[i] })
      i += 1
    } else {
      rows.push({ type: 'added', text: after[j] })
      j += 1
    }
  }

  while (i < beforeLength) {
    rows.push({ type: 'removed', text: before[i] })
    i += 1
  }

  while (j < afterLength) {
    rows.push({ type: 'added', text: after[j] })
    j += 1
  }

  return rows
}

export function countDiffRows(rows: DiffRow[]): { added: number; removed: number } {
  return rows.reduce(
    (result, row) => {
      if (row.type === 'added') result.added += 1
      if (row.type === 'removed') result.removed += 1
      return result
    },
    { added: 0, removed: 0 }
  )
}

export interface DiffSegment {
  type: 'equal' | 'added' | 'removed'
  text: string
}

export interface DiffRowWithWords extends DiffRow {
  /** 行内词级高亮；仅对成对修改的行生成，普通行没有该字段 */
  segments?: DiffSegment[]
}

/**
 * 把文本切成对比用 token：CJK 按单字，其余按连续非空白段，
 * 空白单独成段以保留排版。参考 prompt-optimizer 用 jsdiff 做词级
 * 对比的展示思路，这里用零依赖的等价实现。
 */
export function tokenizeForDiff(text: string): string[] {
  return text.match(/[\u3400-\u4dbf\u4e00-\u9fff]|[^\s\u3400-\u4dbf\u4e00-\u9fff]+|\s+/g) || []
}

const MAX_INLINE_TOKENS = 400

const diffTokens = (before: string[], after: string[]): DiffSegment[] => {
  const rows = before.length
  const cols = after.length
  const table: Uint16Array[] = Array.from(
    { length: rows + 1 },
    () => new Uint16Array(cols + 1)
  )

  for (let i = rows - 1; i >= 0; i -= 1) {
    const row = table[i]
    const nextRow = table[i + 1]
    for (let j = cols - 1; j >= 0; j -= 1) {
      row[j] = before[i] === after[j]
        ? nextRow[j + 1] + 1
        : Math.max(nextRow[j], row[j + 1])
    }
  }

  const raw: DiffSegment[] = []
  let i = 0
  let j = 0
  while (i < rows && j < cols) {
    if (before[i] === after[j]) {
      raw.push({ type: 'equal', text: before[i] })
      i += 1
      j += 1
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      raw.push({ type: 'removed', text: before[i] })
      i += 1
    } else {
      raw.push({ type: 'added', text: after[j] })
      j += 1
    }
  }
  while (i < rows) {
    raw.push({ type: 'removed', text: before[i] })
    i += 1
  }
  while (j < cols) {
    raw.push({ type: 'added', text: after[j] })
    j += 1
  }

  const merged: DiffSegment[] = []
  for (const segment of raw) {
    const last = merged[merged.length - 1]
    if (last && last.type === segment.type) {
      last.text += segment.text
    } else {
      merged.push({ ...segment })
    }
  }
  return merged
}

/**
 * 在行级对比的基础上，为“一对互相对应的修改行”补充词级行内高亮，
 * 粒度对齐 prompt-optimizer 的词级 diff 展示。超过 token 预算或
 * 无法配对的行保持纯行级，避免大段改写时的 O(n·m) 开销。
 */
export function diffRowsWithWords(original: string, optimized: string): DiffRowWithWords[] {
  const rows: DiffRowWithWords[] = diffLines(original, optimized).map(row => ({ ...row }))

  let index = 0
  while (index < rows.length) {
    const row = rows[index]
    if (row.type !== 'removed') {
      index += 1
      continue
    }

    let removedEnd = index
    while (removedEnd < rows.length && rows[removedEnd].type === 'removed') removedEnd += 1
    let addedEnd = removedEnd
    while (addedEnd < rows.length && rows[addedEnd].type === 'added') addedEnd += 1

    const removedCount = removedEnd - index
    const addedCount = addedEnd - removedEnd
    const pairCount = Math.min(removedCount, addedCount)

    for (let offset = 0; offset < pairCount; offset += 1) {
      const removedRow = rows[index + offset]
      const addedRow = rows[removedEnd + offset]
      const beforeTokens = tokenizeForDiff(removedRow.text)
      const afterTokens = tokenizeForDiff(addedRow.text)
      if (beforeTokens.length + afterTokens.length > MAX_INLINE_TOKENS) continue
      removedRow.segments = diffTokens(beforeTokens, afterTokens).filter(
        segment => segment.type !== 'added'
      )
      addedRow.segments = diffTokens(beforeTokens, afterTokens).filter(
        segment => segment.type !== 'removed'
      )
    }

    index = addedEnd > removedEnd ? addedEnd : removedEnd
  }

  return rows
}
