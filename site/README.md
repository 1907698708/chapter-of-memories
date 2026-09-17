# 我的档案 · 个人站

记录我的一切：文字、照片、创作、生活。用 [Astro](https://astro.build) 生成纯静态页面，
可以免费托管，不需要服务器、不需要数据库。

---

## 一、我要改东西，该动哪个文件？

| 我想…… | 改这里 |
|---|---|
| 改站名、简介、作者 | `src/lib/site.ts` |
| 加 / 减 / 改板块（文字·照片·创作·生活） | `src/lib/kinds.ts` |
| 加一条内容 | 在 `src/content/entries/` 新建一个 `.md` 文件 |
| 换配色、字体、间距 | `src/styles/global.css` 最上面的变量 |
| 改「关于」页 | `src/pages/about.astro` |
| 改页头导航、页脚 | `src/layouts/Base.astro` |

改完本地跑一次 `npm run dev` 就能看到效果。

---

## 二、怎么加一条内容

在 `src/content/entries/` 里新建一个 Markdown 文件，**文件名就是网址**：

```
src/content/entries/2026-10-01-国庆去爬山.md
                        └──────┬──────┘
                          网址变成 /entry/2026-10-01-国庆去爬山/
```

文件内容长这样：

```markdown
---
title: 国庆去爬山
date: 2026-10-01
kind: photo
tags: [旅行, 秋天]
place: 黄山
summary: 一句话概括，会显示在列表里。
cover: /uploads/2026/10/xxx.jpg
---

正文用 Markdown 写。

## 小标题

![照片说明](/uploads/2026/10/xxx.jpg)
```

### 前言字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✅ | 标题 |
| `date` | ✅ | 日期，写 `2026-10-01` 就行 |
| `kind` | | 归到哪个板块。默认 `writing` |
| `summary` | | 列表页显示的一句话。不写会自动从正文截 |
| `tags` | | 标签，写成 `[旅行, 秋天]` |
| `cover` | | 封面图路径。照片/创作这类有卡片的地方会用它 |
| `place` | | 地点，显示在标题下面 |
| `draft` | | 写 `true` 就暂时不发布，方便存草稿 |

`kind` 可选值：`writing`（文字）、`photo`（照片）、`work`（创作）、`life`（生活）。

### 加照片

1. 把图片放进 `public/uploads/年/月/`，比如 `public/uploads/2026/10/huangshan.jpg`
2. 正文里写 `![说明](/uploads/2026/10/huangshan.jpg)`
3. 想让它在列表页当封面，前言里加 `cover: /uploads/2026/10/huangshan.jpg`

> ⚠️ **原图不要直接放进来。** 手机拍的原图一张好几 MB，几十张就能让网站慢得没法看。
> 建议先压到长边 2000px 左右、每张 500KB 以内再放。原图自己另外存。
>
> `public/` 里的东西会原样复制到网站，不做压缩。以后要自动压缩可以接入 Astro 的
> 图片处理（把图放 `src/assets/` 并用 `<Image>` 组件），需要的话再说。

---

## 三、本地看效果

```bash
cd F:\workspace\site

npm run dev        # 开发模式，改文件自动刷新，地址 http://localhost:4321
npm run build      # 生成静态网站到 dist/
npm run preview    # 预览 dist/ 里的成品
```

第一次在新电脑上用时，先跑一次 `npm install` 装依赖。

---

## 四、发布上线（Cloudflare Pages，免费）

### 准备

1. 注册一个 GitHub 账号（如果没有）
2. 把 `F:\workspace` 这个仓库推到 GitHub

### 在 Cloudflare 上接上

1. 打开 <https://dash.cloudflare.com> → 注册/登录
2. 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选中你刚推上去的仓库
4. 构建配置**必须这样填**（因为我们把站点放在子目录里）：

   | 配置项 | 填什么 |
   |---|---|
   | Framework preset | `Astro` |
   | **Root directory（根目录）** | **`site`** ← 最容易漏，不填会构建失败 |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | 环境变量 | 加一个 `NODE_VERSION` = `22` |

5. 点 **Save and Deploy**，等一两分钟

完成后会给你一个 `xxxx.pages.dev` 的免费地址，别人就能访问了。

浏览器打开 **手机也能看**，页面是自适应的。

### 以后怎么更新

改完内容 → 提交并推送到 GitHub → Cloudflare 自动重新构建发布。不用手动做任何事。

### 想用自己的域名

Cloudflare Pages 的项目里 → **Custom domains** → 添加你的域名，
按提示去域名商改一下 DNS 即可。免费，不用备案（因为服务器在境外）。

---

## 五、这个站的构成

```
site/
├─ src/
│  ├─ content/entries/     ← 你的内容都在这里（一个 .md 一条）
│  ├─ content.config.ts    ← 内容的字段定义（加字段改这里）
│  ├─ lib/
│  │  ├─ kinds.ts          ← 板块表，加板块改这里
│  │  ├─ site.ts           ← 站名、简介
│  │  ├─ entries.ts        ← 查询逻辑
│  │  └─ format.ts         ← 日期/摘要格式化
│  ├─ layouts/Base.astro   ← 全站外壳（页头、页脚）
│  ├─ components/          ← 卡片、时间线、标签
│  ├─ pages/               ← 路由：首页、板块页、详情页、标签页、关于
│  └─ styles/global.css    ← 全站样式
├─ public/
│  ├─ uploads/             ← 照片放这
│  └─ favicon.svg          ← 小图标
└─ astro.config.mjs        ← 站点配置（部署后把 site 改成正式地址）
```

**加一个板块**只需要在 `src/lib/kinds.ts` 里加一行，导航、首页入口、分类页路由、
标签统计都会自动跟上，不用改别的地方。
