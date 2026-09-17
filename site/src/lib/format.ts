/**
 * 显示用的格式化工具。
 * 只做纯函数，不碰文件系统，方便在任何页面里直接用。
 */

/** `2026 年 9 月 16 日` */
export function formatDate(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

/** `2026-09-16`，用于机器可读的 datetime 属性和排序显示 */
export function formatDateISO(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

/** `2026 年 9 月`，用作时间线分组标题 */
export function formatMonth(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
}

/** 按 `2026-09` 分组用的键 */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * 从 Markdown 正文里抠出一段纯文本摘要。
 *
 * 列表页需要一句话简介。与其要求每篇都手写 summary，不如自动生成一个够用的，
 * 想覆盖时在前言里写 `summary:` 即可。
 */
export function excerpt(markdown: string, max = 96): string {
  const text = markdown
    // 代码块
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    // 图片、链接：留文字不留地址
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // 标题、引用、列表符号
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}\d+\.\s+/gm, '')
    // 强调、行内代码、HTML 标签
    .replace(/[*_`~]/g, '')
    .replace(/<[^>]+>/g, '')
    // 空白归一
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '……'
}
