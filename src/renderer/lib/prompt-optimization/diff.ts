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
