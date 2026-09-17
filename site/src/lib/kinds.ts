/**
 * 内容板块定义。
 *
 * 这是整个站的"目录表"：导航、首页入口、分类页路由、标签统计都从这里生成。
 * **加一个新板块只需要在下面加一行**，其余都会自动跟上。
 *
 * id 必须是纯 ASCII 小写 —— 它会出现在 URL 里（`/photo/`、`/work/`）。
 */
export const KINDS = {
  writing: {
    label: '文字',
    desc: '随笔、长文、笔记',
    glyph: '文',
    gallery: false,
  },
  photo: {
    label: '照片',
    desc: '按时间与事件归类',
    glyph: '影',
    gallery: true,
  },
  work: {
    label: '创作',
    desc: '作品、项目、过程记录',
    glyph: '作',
    gallery: true,
  },
  life: {
    label: '生活',
    desc: '流水、里程碑、清单',
    glyph: '生',
    gallery: false,
  },
} as const

export type KindId = keyof typeof KINDS

/** 板块 id 列表，顺序即导航顺序。 */
export const KIND_IDS = Object.keys(KINDS) as KindId[]

/** 取板块信息；未知 id 兜底成一个能显示的样子，不让页面崩。 */
export function kindOf(id: string) {
  return (
    KINDS[id as KindId] ?? {
      label: id,
      desc: '',
      glyph: '·',
      gallery: false,
    }
  )
}

/** 校验一个字符串是不是合法板块 id。 */
export function isKindId(value: string): value is KindId {
  return Object.prototype.hasOwnProperty.call(KINDS, value)
}
