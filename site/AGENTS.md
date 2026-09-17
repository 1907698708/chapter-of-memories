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

## 粒子层（`src/components/DustField.astro`）

首屏的光尘是手写 canvas，不引第三方库。改的时候守住这几条：

- **只在首屏**。滚出视野必须停（已用 IntersectionObserver 处理），不要让它全站常驻
- **尊重 `prefers-reduced-motion`**：用户开了就一个粒子都不画
- **密度按面积算并封顶**（24~70）。它的定位是"空气感"，不是"星海"
- 颜色走 CSS 变量 `--dust-rgb`，别在 JS 里写死
- 性能底线：用预渲染贴图 `drawImage`（不要每帧 `createRadialGradient`）、
  devicePixelRatio 封顶 2、页面隐藏时停

> ⚠️ **如果哪天觉得"粒子不够显眼，加大密度吧"——方向就错了。**
> 粒子是氛围，不是主角。觉得页面不够有冲击力时，该改的是**排版张力**（字号、层级、留白），
> 不是粒子数量。首屏那组 `clamp()` 字号才是让它不单调的东西。
## 排查渲染问题的正确姿势

**无头浏览器截图会把 CSS 过渡拍在半路**，看起来就像"内容没显示 / 淡掉了"。
别据此判断页面坏了 —— 我已经被这个假象骗过一次。

验证最终状态的正确做法：加 `--force-prefers-reduced-motion` 截图。
它会让 `prefers-reduced-motion: reduce` 分支生效（`transition: none`），
拍到的就是动画结束后的稳定状态。

```bash
msedge --headless=new --disable-gpu --force-prefers-reduced-motion \
  --virtual-time-budget=6000 --screenshot=out.png --window-size=1440,1700 <url>
```

另外 `--virtual-time-budget` 只快进定时器和网络，**不驱动 CSS 过渡**，
所以加大它并不能让过渡跑完。`--dump-dom` 在 `--headless=new` 下也不输出。

## "默认隐藏、靠 JS 放出来"的动画必须做降级

入场动画（`[data-reveal]`）有个致命故障模式：**JS 一旦不工作，内容就永久隐形**。
比"没有动画"严重得多。所以有两道保险，改的时候不许去掉：

1. CSS 里写成 `.js [data-reveal]`，`.js` 由 `<head>` 里的内联脚本添加。
   无 JS → 没有这个类 → 规则不匹配 → 内容正常显示。
2. `initReveal()` 里有个 2 秒兜底：观察器一次都没回调就全部放出来。

改完必须静态核实编译产物里每条隐藏规则都带 `.js` 前缀。
## 📐 当前架构（2026-09-17 状态）

改造过几轮，这里记录**最终形态和为什么**，避免后来的会话推翻已有决策或重复踩坑。

### 页面结构

| 文件 | 职责 |
|---|---|
| `src/pages/index.astro` | 首页 = 空间场景 + 最近的记录列表 |
| `src/components/SpaceScene.astro` | 首屏的 3D 空间（悬浮面板 + 透视地板 + 摄像机视差） |
| `src/components/SectionRail.astro` | 左侧图标轨，栏目切换的兜底路径 |
| `src/components/AmbientBackdrop.astro` | 全站动态背景（流动色雾 + 颗粒） |
| `src/components/DustField.astro` | 首屏光尘 + 鼠标光晕 |
| `src/pages/[kind]/index.astro` | 栏目页，按 layout 决定排法 |
| `site.config.mjs` | **栏目定义（用户改这里，或跑 npm run section）** |

### 几个不能随便改的设计决策

**1. 顶部导航是故意取消的。**
用户明确不喜欢"一排横向链接切换栏目"。现在的结构是：
- **主路径**：首页的面板和栏目页头部共用 `transition:name`（`kind-<id>`），
  点击是共享元素转场 —— 面板"长大变成页面"，不是淡出淡入。**删掉这个 name 就退化成普通跳转。**
- **兜底**：`SectionRail` 在任何页面都能切换。**不能只留主路径** —— 否则进了栏目页就出不来。

**2. 空间的静态帧必须读得出纵深。**
缩放差异（perspective + translateZ）、大气透视（远的面板 blur + 降透明）、
透视地板 —— 这三样保证关掉动画、无 JS、`prefers-reduced-motion` 时它**仍然是一个空间**，
不会退回成"一页列表"。改的时候守住这个性质。

**3. `translateZ` 的放大绕父级 `perspective-origin` 做，元素自己的 `transform-origin` 管不了它。**
所以前景块（`.space__front`）的 Z 值不能太大，否则会被顶出视口、底部文字被切掉。
踩过：Z=185px 时简介被切，改 120px + 上移才对。

**4. 断点是 60rem，不是 46rem。**
窄屏（<=60rem）放弃 3D 摆位，改成两列网格 + 缩放/透明度表示远近。
踩过：只把节点设成 `left:50%` 会让四个面板全叠在中轴上互相压住、标题被挡 ——
那是真 bug，不是不好看。3D 在手机上摊不开。

**5. 标题用霞鹜文楷（`--font-display`），但它只有 400 字重。**
写 `font-weight: 700` 会触发浏览器合成假粗体、笔画发糊。
标题的分量靠**字号和留白**做，不靠加粗。

### 未完成 / 下一步候选

按价值排序，都没做：

1. **栏目页也空间化** —— 现在只有首页是空间，进去是常规页面（虽然有自己的主色和排法）
2. **滚动时场景向后退** —— 产生"走进空间"的连续感
3. **页头右侧加搜索 / 命令面板** —— 顶部现在只有站名，右边是空的
4. **图片灯箱** —— 详情页的图点不开
5. **内容还是空的** —— 四个栏目各一条示例，两张明显占位图

### 已知不足

- `astro check` 没跑过（`src/lib/kinds.ts` 里 import 用户手改的 `.mjs`，没有类型声明，可能会报）
- 详情页没有阅读进度条
- 标签页没做过视觉设计，比较素
- `dist/` 有 4.3MB 字体分块（97 个），浏览器按 unicode-range 只取需要的几块，
  但部署时会全部上传
