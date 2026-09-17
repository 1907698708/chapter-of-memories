# site 项目规矩

个人档案站。Astro 静态站，输出纯 HTML，部署到 Cloudflare Pages。

## 技术约束

- **Astro 5**，纯静态输出（`output: 'static'`，默认值）。不要引入服务端渲染、数据库、后端接口
- **不引入 UI 框架**（React/Vue/Svelte）—— 这个站只有文字和图片，用不上，只会拖慢构建
- **不引入 Tailwind** —— 样式都在 `src/styles/global.css` 里手写，改起来直观，也不用多一层构建
- 依赖越少越好。加依赖前先想：这个能不能用 CSS 或十几行代码解决

## 内容模型

**只有一个集合 `entries`**，靠 `kind` 字段区分板块。

不要拆成多个集合。理由是"记录一切"意味着板块会不断增减；单一宽集合加字段不用改结构，
多个集合则每加一类都要改 schema、改查询、改路由。

加板块改 `src/lib/kinds.ts` 一处即可 —— 导航、首页入口、分类页路由都从它生成。

## 路径与命名的约定

- **站点内部的路由、板块 id、文件名一律 ASCII**（`/photo/`、`kind: writing`）。
  中文只出现在**内容本身**（标题、正文、标签）。
  这样 URL 干净、不会到处被百分号编码。
- 内容文件名用 `YYYY-MM-DD-短名.md`，它会成为网址。

## 图片

- `public/uploads/` 里放的是**已经压好的**发布图，不要放原图
- 原图另存，不进仓库（`.gitignore` 已排除 `原图/`）
- 一期不接入 Astro 图片处理；要接的话把图移到 `src/assets/` 并用 `<Image>` 组件

## 改完必须做

```bash
npm run build     # 必须通过，不能有报错
```

构建通过再提交。改了布局或样式的话，用 `npm run preview` 起服务，
再用无头浏览器截图**亲眼看一眼**（`msedge --headless=new --screenshot=...`），
别只靠想象。

## 别做的事

- 不要在页面里硬编码站名 —— 用 `src/lib/site.ts`
- 不要为了一个页面引入新依赖
- 不要把 `dist/`、`node_modules/`、`.astro/` 提交进仓库
