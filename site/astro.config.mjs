// @ts-check
import { defineConfig } from 'astro/config'

// 部署时把 site 改成你的正式地址（Cloudflare Pages 会给一个 xxx.pages.dev）。
// 它只影响绝对链接和 sitemap，本地开发不用管。
export default defineConfig({
  site: 'https://example.pages.dev',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
})
