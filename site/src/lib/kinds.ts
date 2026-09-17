/**
 * 栏目（板块）定义。
 *
 * **真正的源在项目根目录的 `site.config.mjs`** —— 那是给用户改的文件。
 * 这里只负责读它、排序、提供查询方法。
 *
 * 加删栏目请改 site.config.mjs，或者运行 `npm run section` 用菜单操作。
 * 不要在这个文件里硬编码栏目。
 */

// @ts-ignore -- site.config.mjs 是给用户手改的普通 JS，没有类型声明
import { SECTIONS, DEFAULT_SECTION } from '../../site.config.mjs'

export type SectionLayout = 'stream' | 'gallery' | 'timeline'

export interface Section {
  id: string
  label: string
  desc: string
  glyph: string
  color: string
  layout: SectionLayout
  order: number
}

/** 按 order 排好序的栏目列表。顺序即导航顺序。 */
export const SECTIONS_LIST: Section[] = [...(SECTIONS as Section[])].sort(
  (a, b) => (a.order ?? 0) - (b.order ?? 0),
)

/** 所有栏目 id。用于生成路由和内容 schema 的枚举。 */
export const KIND_IDS = SECTIONS_LIST.map((s) => s.id) as [string, ...string[]]

/** 不填 kind 时归到哪个栏目。 */
export const DEFAULT_KIND: string = DEFAULT_SECTION

/** 以 id 为键的映射，方便按 id 取。 */
export const KINDS: Record<string, Section> = Object.fromEntries(
  SECTIONS_LIST.map((s) => [s.id, s]),
)

const FALLBACK: Omit<Section, 'id'> = {
  label: '未分类',
  desc: '',
  glyph: '·',
  color: '#9a6b3f',
  layout: 'stream',
  order: 999,
}

/**
 * 取栏目信息。
 * 未知 id 也能返回一个能显示的样子，不让页面崩 -- 比如栏目被删了但还有旧内容引用它。
 */
export function kindOf(id: string): Section {
  return KINDS[id] ?? { id, ...FALLBACK }
}

/** 判断是不是合法栏目 id。 */
export function isKindId(value: string): value is string {
  return Object.prototype.hasOwnProperty.call(KINDS, value)
}