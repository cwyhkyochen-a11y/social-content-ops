---
name: content-ops
description: Social media content operations automation system with SQLite database. Supports content crawling, curation, publish tasks, unified dispatch, and X API publishing with OAuth/token refresh.
---

# Content Ops System

社交媒体内容运营自动化系统，使用 **SQLite + Drizzle ORM** 存储数据，支持内容抓取、语料审核、发布任务管理、多平台发布和数据分析。

**核心能力：**
- 📥 小红书内容抓取（MCP 服务）
- 🚀 多平台发布：X (Twitter)、Threads、Facebook、Pinterest、Instagram、小红书
- 🖥️ Web 控制台：可视化任务管理、账号管理、发布记录查看
- 📊 统一调度入口（publish-dispatch.py）+ 发布日志回写
- 🎨 AI 配图生成（集成 baoyu-skills）
- 🔐 X API OAuth 授权 + Token 自动刷新

---

## 📋 目录

1. [当前项目状态](#零当前项目状态)
2. [推荐使用方式](#一推荐使用方式)
3. [初始化部署](#二初始化部署)
4. [X-API-使用](#三x-api-使用)
5. [统一调度入口](#四统一调度入口)
6. [抓取与发布工作流](#五抓取与发布工作流)
7. [参考文档](#六参考文档)

---

## 零、当前项目状态

### 0.1 当前重点

目前项目里最实用、最稳定的能力集中在：

**发布能力（已接入统一调度）：**
- **X (Twitter)**：`x_post_api.ts` / `x_post_api.sh` - API 路线支持文本、thread、图片
- **Threads**：`threads_publish.py` - 文本、图片、视频、Carousel
- **Facebook**：`facebook_publish.py` - 个人主页、页面发布
- **Pinterest**：`pinterest_publish.py` - Pin 发布、Board 管理
- **Instagram**：`instagram_publish.py` - 图片、Carousel、Story（浏览器自动化）
- **小红书**：`redbookskills/` - 图文/视频发布子技能

**基础设施：**
- `publish-dispatch.py`：统一发布调度入口（task-driven）
- `publish-log.ts`：通用发布日志回写
- `x_refresh_token.ts`：X token 自动刷新
- `console-server.mjs`：Web 控制台服务端
- `console-public/index.html`：Web 控制台前端

### 0.2 Web 控制台（v0.3.0 新增）

提供可视化界面管理整个内容运营流程：

**功能：**
- 登录认证（可自定义账号密码）
- 平台 / 账号筛选管理
- 手动创建发布任务
- 上传图片 / 视频
- 查看发布记录（成功 / 失败 / 待执行）
- 查看任务详情和 `publish_results.raw`
- 手动执行 / 重新执行发布
- 按平台动态做前后端校验

**启动：**
```bash
npm run console
# 默认监听 127.0.0.1:3210
```

**公网部署：** 支持 Caddy/Nginx 子路径反代，见 `docs/CONSOLE.md`

### 0.3 X 当前结论

X 当前保留两条路线，但优先级已经变化：

#### A. X API 路线（当前主线）
- 脚本：`skills/content-ops/scripts/x_post_api.ts`
- 能力：
  - OAuth 2.0 授权
  - token 落库
  - token 自动 refresh
  - 文本发帖
  - 自动 thread
  - 图片上传
  - 通用发布日志回写
- 结论：**当前优先走这条路线**

#### B. Playwright 持久化 profile 路线（保留）
- 脚本：`skills/content-ops/scripts/x_publish_pw.py`
- 适用场景：
  - API 不可用时的备选
  - 人工登录 / 调试 UI
- 风险：
  - 风控明显更强
  - 数据中心 IP 容易被拦截
- 结论：**保留，但不再作为主线**

### 0.4 通用发布日志现状

当前发布结果统一写入：

- `publish_tasks.content.publish_results`

这套结构已供 X / Threads / Facebook / Pinterest 复用，Instagram 和小红书走独立链路。

### 0.5 当前已知限制

- X 视频上传还未完成
- 小红书详情抓取仍然受网页端限制
- Instagram 仅支持浏览器自动化路线

### 0.6 下一版本 Roadmap

以下项目已确定为下一版本目标：

- Instagram API 路线调研
- 更完整的统一 scheduler / retry 机制
- X 视频上传完成

---

## 一、推荐使用方式

### 1. 临时直接发 X

```bash
cd /root/.openclaw/workspace/skills/content-ops
./scripts/x_post_api.sh \
  --account-id 0db12439-06fe-438a-968c-028471d74401 \
  --text "你的内容"
```

### 2. 正式走 publish task 调度流

```bash
python skills/content-ops/scripts/publish-dispatch.py --task-id <TASK_ID>
python skills/content-ops/scripts/publish-dispatch.py --task-id <TASK_ID> --execute
```

推荐原则：
- **临时发帖** → 直接用 `x_post_api.sh`
- **正式运营流** → 用 `publish-dispatch.py --task-id`

---

## 二、初始化部署

### 2.1 基础环境

```bash
cd /root/.openclaw/workspace/skills/content-ops
npm install
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 2.2 （可选）小红书 MCP 服务

```bash
cd ~/.openclaw/workspace/bin
wget https://github.com/xpzouying/xiaohongshu-mcp/releases/download/v2026.02.28.1720-8a7fe21/xiaohongshu-mcp-linux-amd64.tar.gz
tar -xzf xiaohongshu-mcp-linux-amd64.tar.gz
./xiaohongshu-login
./xiaohongshu-mcp -headless=true
```

### 2.3 数据库位置

```text
~/.openclaw/workspace/content-ops-workspace/data/content-ops.db
```

---

## 三、X API 使用

### 3.1 环境变量

```bash
export X_CLIENT_ID='你的 client id'
export X_CLIENT_SECRET='你的 client secret'
export X_REDIRECT_URI='https://your-domain.com/auth/x/callback'
export X_SCOPES='tweet.read tweet.write users.read offline.access'
```

**注意：** OAuth 回调域名需要与 X Developer Portal 中配置的回调地址一致，且必须可公网访问。

### 3.2 发文本

```bash
./scripts/x_post_api.sh \
  --account-id 0db12439-06fe-438a-968c-028471d74401 \
  --text "你的内容"
```

### 3.3 dry-run

```bash
./scripts/x_post_api.sh \
  --account-id 0db12439-06fe-438a-968c-028471d74401 \
  --text "测试内容" \
  --dry-run
```

### 3.4 自动 thread

```bash
./scripts/x_post_api.sh \
  --account-id 0db12439-06fe-438a-968c-028471d74401 \
  --text "长内容" \
  --thread
```

### 3.5 图片发帖

```bash
./scripts/x_post_api.sh \
  --account-id 0db12439-06fe-438a-968c-028471d74401 \
  --text "配图内容" \
  --images /tmp/a.png /tmp/b.jpg
```

### 3.6 刷新 token

```bash
npx tsx scripts/x_refresh_token.ts --account-id 0db12439-06fe-438a-968c-028471d74401
```

---

## 四、统一调度入口

### 4.1 task 模式（推荐）

```bash
python skills/content-ops/scripts/publish-dispatch.py --task-id <TASK_ID>
python skills/content-ops/scripts/publish-dispatch.py --task-id <TASK_ID> --execute
```

行为：
- 从 `publish_tasks` 读取内容
- 从 `target_accounts` 读取目标账号
- X 平台默认走 API 发布
- 长文本自动 thread
- `generated_images.images` 自动并入图片
- 成功后结果写回 `publish_results`

### 4.2 legacy 配置模式

```bash
python skills/content-ops/scripts/publish-dispatch.py \
  --platform pinterest --account main --title "Pin" --text "desc" --image /tmp/a.png
```

### 4.3 X 模式选择

默认：
- `--x-mode api`

如果必须走旧浏览器方案：

```bash
python skills/content-ops/scripts/publish-dispatch.py \
  --platform x --account main --text "hello" --x-mode browser
```

### 4.4 支持的平台

| 平台 | 脚本 | 接入统一调度 | 支持内容 |
|------|------|-------------|---------|
| X (Twitter) | `x_post_api.ts` / `x_publish_pw.py` | ✅ | 文本、thread、图片 |
| Threads | `threads_publish.py` | ✅ | 文本、图片、视频、Carousel |
| Facebook | `facebook_publish.py` | ✅ | 文本、图片、视频 |
| Pinterest | `pinterest_publish.py` | ✅ | Pin、Board 管理 |
| Instagram | `instagram_publish.py` | ❌（浏览器自动化）| 图片、Carousel、Story |
| 小红书 | `redbookskills/` | ❌（子技能）| 图文、视频 |

---

## 五、抓取与发布工作流

### 5.1 内容抓取

```bash
npx tsx scripts/create-crawl-task.ts \
  --platform xiaohongshu \
  --keywords "AI人工智能,ChatGPT,AI工具" \
  --target-count 50
```

### 5.2 审核结果

```bash
npx tsx scripts/show-crawl-results.ts --task-id <task-id>
npx tsx scripts/approve-all.ts --task-id <task-id>
```

### 5.3 创建发布任务

```bash
npx tsx scripts/create-publish-task.ts \
  --source-ids <note-id-1>,<note-id-2> \
  --target-platform x \
  --target-account <account-id>
```

### 5.4 调度发布

```bash
python skills/content-ops/scripts/publish-dispatch.py --task-id <publish-task-id> --execute
```

---

## 六、参考文档

- `README.md` - 项目总览
- `docs/CONSOLE.md` - Web 控制台使用说明
- `docs/X_API_SETUP.md` - X API 接入配置
- `docs/X_API_OPERATIONS.md` - X API 日常操作
- `docs/PUBLISH_DISPATCH.md` - 统一调度入口说明
- `docs/PUBLISH_LOGS.md` - 发布日志结构
- `references/database-schema.md` - 数据库表结构

---

## 快速检查清单

### X API 检查
- [ ] 回调域名可访问
- [ ] OAuth 已授权
- [ ] token 已落库
- [ ] `x_post_api.sh --dry-run` 正常
- [ ] 文本发帖成功

### 调度层检查
- [ ] `publish_tasks` 中已有任务
- [ ] `target_accounts` 中目标账号存在
- [ ] `publish-dispatch.py --task-id` 能生成命令
- [ ] `--execute` 后结果能写回 `publish_results`
