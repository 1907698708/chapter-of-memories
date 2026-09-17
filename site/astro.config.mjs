// @ts-check
import { defineConfig } from 'astro/config'

// 部署地址。影响绝对链接、分享卡片和以后的 sitemap。换了自定义域名记得改这里。
// 它只影响绝对链接和 sitemap，本地开发不用管。
export default defineConfig({
  site: 'https://chapter-of-memories.pages.dev',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
})
