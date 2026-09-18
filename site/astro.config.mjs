// @ts-check
import { defineConfig } from 'astro/config'
import remarkBreaks from 'remark-breaks'

// 部署地址。影响绝对链接、分享卡片和以后的 sitemap。换了自定义域名记得改这里。
// 它只影响绝对链接和 sitemap，本地开发不用管。
export default defineConfig({
  site: 'https://chapter-of-memories.pages.dev',
  markdown: {
    // 让单个换行也生效（和 GitHub 一致）。没有它，Markdown 会把
    // 换行合并成一行 —— 诗的分行会全部丢失。
    remarkPlugins: [remarkBreaks],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
})
