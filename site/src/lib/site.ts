/**
 * 站点级配置。改站名、简介、作者都在这里，只此一处。
 */
export const SITE = {
  /** 站名。显示在页头、页脚、浏览器标题 */
  title: '记忆之章',

  /** 一句话简介。出现在首页和分享卡片 */
  description: '欢迎来到记忆之章',

  /** 你的名字或昵称。留空则不显示 */
  author: '谬',

  /**
   * 头像。图片放到 site/public/ 下，这里写以 / 开头的路径。
   * 文件不存在时会自动降级成昵称首字，不会出现裂图。
   */
  avatar: '/avatar.jpg',

  /** 语言，影响 <html lang> */
  lang: 'zh-CN',
} as const
