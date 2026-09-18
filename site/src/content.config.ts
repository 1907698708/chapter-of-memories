import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { KIND_IDS } from './lib/kinds'

/**
 * 唯一的集合：一条内容 = 一个 Markdown 文件。
 *
 * 为什么只用一个集合而不是每类一个：
 *   你要的是"记录一切"，板块以后会加、会变。一个宽集合 + 一个 `kind` 字段，
 *   加新类型不用动任何结构；分成多个集合则每加一类都要改 schema、改查询、改路由。
 *
 * 文件放 src/content/entries/，文件名用 `YYYY-MM-DD-短名.md`，例如
 *   2026-09-16-第一篇.md
 * 文件名去掉 .md 就是它的 id，也是详情页地址 /entry/2026-09-16-第一篇/
 */
const entries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/entries' }),
  schema: z.object({
    /** 标题。必填。 */
    title: z.string(),

    /** 日期。写 `2026-09-16` 或带时间都行；不写时间就按当天 00:00 算。 */
    date: z.coerce.date(),

    /** 属于哪个板块。可选，默认"文字"。 */
    kind: z.enum(KIND_IDS as [string, ...string[]]).default('writing'),

    /** 一句话摘要。列表页和分享卡片会用它；不写就从正文自动截。 */
    summary: z.string().optional(),

    /** 标签。用于 /tags/ 归档和关联。 */
    tags: z.array(z.string()).default([]),

    /** 封面图路径，如 `/uploads/2026/09/xxx.jpg`。列表页优先用它。 */
    cover: z.string().optional(),

    /** 地点。照片和生活流水常用。 */
    place: z.string().optional(),

    /**
     * 正文怎么排。默认 `prose`（普通文章）。
     * 写 `poem` 会换成诗排版：保留换行、行距放宽、不首行缩进。
     * 「诗」栏目里的内容自动按诗排，不用写这个字段。
     */
    format: z.enum(['prose', 'poem']).default('prose'),

    /**
     * 同一天发布多条时的先后（数字小的排前面）。
     * 日期相同的话，光靠日期排不出顺序 —— 会退回按文件名排，
     * 而中文文件名的顺序是乱的。像组诗这种一天发好几首的，用它定序。
     */
    order: z.number().optional(),

    /** 标 true 就不出现在列表和构建产物里，方便先存草稿。 */
    draft: z.boolean().default(false),
  }),
})

export const collections = { entries }
