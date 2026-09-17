import { getCollection, type CollectionEntry } from 'astro:content'
import { monthKey } from './format'

export type Entry = CollectionEntry<'entries'>

/**
 * 全部内容，按日期从新到旧。
 *
 * 草稿（frontmatter 里 `draft: true`）在这里就被过滤掉了，
 * 所以页面不需要各自再判断一次。
 */
export async function allEntries(): Promise<Entry[]> {
  const list = await getCollection('entries', ({ data }) => !data.draft)
  return list.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/** 某个板块的内容。 */
export async function entriesOfKind(kind: string): Promise<Entry[]> {
  return (await allEntries()).filter((e) => e.data.kind === kind)
}

/** 按 `2026-09` 分组，组内保持原有顺序（新→旧），组间也新→旧。 */
export function groupByMonth(entries: Entry[]): Array<{ key: string; label: string; items: Entry[] }> {
  const groups = new Map<string, Entry[]>()
  for (const entry of entries) {
    const key = monthKey(entry.data.date)
    const bucket = groups.get(key)
    if (bucket) bucket.push(entry)
    else groups.set(key, [entry])
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, items]) => ({ key, label: items[0]!.data.date, items }))
}

/** 每个板块有多少条，用于首页入口卡。 */
export async function kindCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const entry of await allEntries()) {
    const kind = entry.data.kind
    counts[kind] = (counts[kind] ?? 0) + 1
  }
  return counts
}

/** 所有标签及其出现次数，按次数从多到少。 */
export async function tagCounts(): Promise<Array<{ tag: string; count: number }>> {
  const counts = new Map<string, number>()
  for (const entry of await allEntries()) {
    for (const tag of entry.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/** 取某条内容的 id（用于拼详情页地址）。 */
export function entryHref(entry: Entry): string {
  return `/entry/${entry.id}/`
}
