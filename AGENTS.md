# F:\workspace 工作区约定

这是一个**纯 ASCII 路径**的工作区，专门放**需要被工具链处理**的项目
（要装依赖、要构建、要打包的）。与 `F:\总工作区` 并列，分工不同。

## 为什么单独开一个

中文路径会踩坑：`cmd.exe` 处理不了、部分 CLI 和构建工具会出错、路径被 URL 编码后
面目全非。需要跑工具链的项目放这里；纯文档、素材、产出留在 `F:\总工作区`。

## 目录

| 目录 | 放什么 |
|---|---|
| `site/` | 个人档案站（Astro 静态站）。内容、页面、构建配置都在里面 |

## 硬性规则

- 项目内部路径**保持纯 ASCII**，文件名也一样（除非是内容本身，比如文章标题）
- `node_modules/`、`dist/`、`.astro/` 不进 git
- **装依赖、升级依赖、批量改文件名之前，先提交一次**（git 是后悔药）
- 新增项目时在本文件补一行目录职责

## 版本控制

本工作区是独立 git 仓库。规矩同 `F:\总工作区`：完成一个能跑通的阶段就提交一次，
危险的批量操作之前先提交。

## 全局规矩

`~/.dsh/AGENTS.md` 会自动加载，那里有优先级最高的两条：**删除规则**（只删本次自建的
临时文件，其余先问）和**别记假成功日志**（写"已完成"前必须验证）。

## 环境：推送走哪条路，每次先实测

这台机器访问 GitHub 的路径**会来回变**，而且方向不固定：

- 有时**直连能通、代理反而是坏的** —— 代理端口在监听，但不转发流量
- 有时**直连被切断、必须走代理**
- **系统代理设置和"实际能不能转发"是两回事**，端口在监听不代表通

所以**不要把 `git config http.proxy` 设死**。踩过：代理坏掉之后 git 一直失败，
而 `curl` 直连明明返回 200 —— 因为 git 里还配着那个坏代理。

**每次推送用这个脚本，它会自己选路**：

```powershell
powershell -File F:\总工作区\.dsh-app\push.ps1 -Repo F:\workspace
```

它对直连和代理各发一个 HEAD 请求实测，用能通的那条推（直连优先），
两条都不通才需要人工开梯子。

手动排查等价于：

```powershell
curl.exe -s -o NUL -w "%{http_code}" --max-time 10 https://github.com
curl.exe -x http://127.0.0.1:7897 -s -o NUL -w "%{http_code}" --max-time 10 https://github.com
```

`200` 就是通。代理端口用 `Get-NetTCPConnection -State Listen` 找，
软件不同端口会变。

## 排查网络：用 curl，别用 Invoke-WebRequest

这台机器上 **`Invoke-WebRequest` 走系统代理不可靠** —— 会对完全正常的 URL 持续报错，
而 `curl.exe` 直连和走代理都返回 200。已经被这个骗过一次
（误判成"Cloudflare 部署失败"，实际是 PowerShell 的问题）。

验证线上站点一律用 curl：

```powershell
# 只看状态码
curl.exe -s -o NUL -w "%{http_code}" --max-time 20 <url>

# 取内容再在 PowerShell 里分析
curl.exe -s -o out.html --max-time 30 <url>
$c = [System.IO.File]::ReadAllText('out.html', (New-Object System.Text.UTF8Encoding($false)))
```

如果连 curl 都失败，再去查代理端口（见上一节）和 DNS。
## 提交时的两个坑

**一、多行提交信息不能用 `git commit -m`**

Windows 下命令行里的换行会被当成参数分隔符，信息会被拆开，
里面的斜杠（比如"增/删/改"）会被当成路径，报
`fatal: /: '/' is outside repository`。

写多行信息一律用文件：

```powershell
$msg = "C:\Users\ASUS\.dsh\_commitmsg.txt"   # 写到仓库之外
[System.IO.File]::WriteAllText($msg, $content, (New-Object System.Text.UTF8Encoding($false)))
git commit -F $msg
Remove-Item $msg -Force
```

**二、临时文件会被 `git add -A` 一起提交**

在仓库里创建提交信息文件 → `git add -A` → 它自己也被提交进去了。
犯过两次。

所以：**提交信息的临时文件写到仓库之外**（用 `$DSH_HOME`），
并且 `.gitignore` 里有 `/_*` 兜底 —— 根目录下 `_` 开头的文件一律不入库。

提交前养成看一眼 `git status --short` 的习惯。
## 📍 动 site/ 之前先读 site/AGENTS.md

规则文件是**从当前目录沿祖先链往上找**的。新会话的工作区通常是 `F:\workspace`，
而 `site/` 是它的子目录 —— 所以 `site/AGENTS.md` **不会自动加载**。

那个文件里有个人档案站的完整架构与设计决策（顶部导航为什么取消、
空间的静态帧为什么必须有纵深、断点为什么是 60rem、霞鹜文楷为什么不能加粗等），
以及未完成事项和已知不足。**改动前手动读一下。**