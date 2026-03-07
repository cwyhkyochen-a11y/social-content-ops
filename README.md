# Social Content Ops - 社交媒体内容运营自动化

<p align="center">
  <strong>🤖 AI 驱动的内容抓取、策划、发布与数据分析系统</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/OpenClaw-Skill-blue" alt="OpenClaw Skill">
  <img src="https://img.shields.io/badge/Version-0.3.0-green" alt="Version">
  <img src="https://img.shields.io/badge/Platform-X%20%7C%20Instagram%20%7C%20Facebook%20%7C%20Threads%20%7C%20Pinterest%20%7C%20Xiaohongshu-orange" alt="Platform">
  <img src="https://img.shields.io/badge/Storage-SQLite%20%2B%20Drizzle-purple" alt="Storage">
</p>

---

## 🎯 项目简介

**Social Content Ops** 是一个运行在 OpenClaw 里的社交媒体内容运营自动化系统。支持从小红书抓取优质内容，经过 AI 改编后发布到 X (Twitter)、Instagram、Facebook、Threads、Pinterest 等平台，并提供完整的数据分析功能。

当前版本重点完成了两条主线：

1. **Task-driven publishing** 已从 X 扩展到 Threads / Facebook / Pinterest 等平台
2. 新增了一个 **可本地运行、可公网部署的 content-ops 控制台**

---

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 📥 **智能抓取** | 支持小红书搜索抓取，自动评估内容质量 |
| 🤖 **AI 改编** | 基于语料生成适配目标平台的内容 |
| 🎨 **AI 配图** | 集成 baoyu-skills，自动生成小红书风格配图 |
| 👥 **人机协作** | 关键节点需人工确认，确保内容质量 |
| 📊 **数据分析** | 自动追踪发布内容的互动数据，生成复盘报告 |
| 🖥️ **Web 控制台** | 可视化界面管理账号、创建任务、执行发布 |
| 🗄️ **本地存储** | SQLite + Drizzle ORM，无需外部数据库 |
| 🔧 **易于扩展** | 模块化设计，支持添加新平台 |

---

## 🎨 AI 配图生成

本项目集成 [baoyu-skills](https://github.com/JimLiu/baoyu-skills) 的配图生成能力：

### 支持的生成方式

| 工具 | 适用平台 | 特点 |
|------|----------|------|
| **xhs-images** | 小红书 | 1-10张系列图，9种风格 × 6种布局 |
| **infographic** | Reddit/Pinterest | 专业信息图，20种布局 × 17种风格 |
| **cover-image** | 通用 | 封面图，5维定制系统 |

### 视觉风格

- **cute** (可爱) | **fresh** (清新) | **warm** (温暖)
- **bold** (大胆) | **minimal** (极简) | **retro** (复古)
- **pop** (流行) | **notion** | **chalkboard** (黑板)

### 布局类型

- **sparse** (稀疏1-2点) - 封面、金句
- **balanced** (平衡3-4点) - 常规内容
- **dense** (密集5-8点) - 知识卡片
- **list** (列表) - 清单、排行
- **comparison** (对比) - 优劣分析
- **flow** (流程) - 步骤、时间线

---

## 📁 项目结构

```
social-content-ops/
├── 📄 SKILL.md                    # 主技能文档（OpenClaw 使用）
├── 📄 README.md                   # 本文件
├── 📂 src/
│   ├── db/                        # 数据库相关
│   │   ├── index.ts               # 数据库连接与查询
│   │   ├── schema.ts              # Drizzle ORM 表结构定义
│   │   └── migrations/            # 数据库迁移文件
│   ├── integrations/              # 平台集成
│   │   └── x/                     # X (Twitter) API 集成
│   ├── account_sync.ts            # 账号同步
│   └── console-server.mjs         # Web 控制台服务端
├── 📂 scripts/                    # 操作脚本
│   ├── create-crawl-task.ts       # 创建抓取任务
│   ├── show-crawl-results.ts      # 查看抓取结果
│   ├── approve-all.ts             # 批量审核通过
│   ├── generate-images.ts         # AI 配图生成
│   ├── configure-account-style.ts # 配置账号视觉风格
│   ├── publish-dispatch.py        # 统一发布调度入口
│   ├── *_publish.py               # 各平台发布脚本
│   └── ...                        # 更多脚本
├── 📂 redbookskills/              # 小红书发布子技能
│   ├── SKILL.md                   # 子技能文档
│   └── scripts/                   # 发布相关脚本
├── 📂 xiaohongshutools/           # 小红书工具子技能
│   └── scripts/                   # 加密、请求工具
├── 📂 console-public/             # Web 控制台前端
│   └── index.html                 # 控制台界面
├── 📂 docs/                       # 文档
│   ├── CONSOLE.md                 # 控制台说明
│   ├── PUBLISH_DISPATCH.md        # 统一调度入口说明
│   ├── PUBLISH_LOGS.md            # 发布日志结构
│   ├── X_API_SETUP.md             # X API 接入说明
│   └── ...                        # 更多文档
├── 📂 references/                 # 参考文档
├── 📄 QUICKSTART.md               # 快速上手指南
├── 📄 USER_WORKFLOW.md            # 完整用户操作手册
├── 📄 package.json                # Node.js 依赖
└── 📄 drizzle.config.ts           # Drizzle 配置
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- SQLite 3
- Python 3.10+

### 1. 安装依赖

```bash
# 克隆仓库
git clone https://github.com/cwyhkyochen-a11y/social-content-ops.git
cd social-content-ops

# 安装 Node.js 依赖
npm install

# 安装 baoyu-skills (AI 配图生成)
npx skills add jimliu/baoyu-skills

# 生成并执行数据库迁移
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 2. 启动控制台

```bash
npm run console
```

默认监听：

- Host: `127.0.0.1`
- Port: `3210`

默认登录账号：

- 用户名：`kyochen`
- 密码：`kyochen28`

可通过环境变量覆盖：

```bash
CONTENT_OPS_CONSOLE_HOST=127.0.0.1
CONTENT_OPS_CONSOLE_PORT=3210
CONTENT_OPS_CONSOLE_USER=kyochen
CONTENT_OPS_CONSOLE_PASSWORD=kyochen28
CONTENT_OPS_CONSOLE_SESSION_SECRET=change-me
```

### 3. 配置 MCP 服务（小红书抓取）

```bash
# 下载小红书 MCP 服务
mkdir -p ~/.openclaw/workspace/bin
cd ~/.openclaw/workspace/bin

wget https://github.com/xpzouying/xiaohongshu-mcp/releases/download/v2026.02.28.1720-8a7fe21/xiaohongshu-mcp-linux-amd64.tar.gz
tar -xzf xiaohongshu-mcp-linux-amd64.tar.gz

# 首次登录（扫码）
./xiaohongshu-login

# 启动服务
./xiaohongshu-mcp -headless=true
```

---

## 📖 使用流程

### 方式一：Web 控制台（推荐）

控制台支持：

- 登录访问
- 选择平台 / 账号手动创建发布任务
- 上传图片 / 视频
- 查看代运营账号列表与详情
- 查看发布记录（成功 / 失败 / 待执行）
- 查看任务详情和 `publish_results.raw`
- 手动执行发布 / 重新执行
- 按平台动态做前后端校验

### 方式二：命令行脚本

#### 第一步：内容抓取

```bash
# 创建抓取任务
npx tsx scripts/create-crawl-task.ts \
  --platform xiaohongshu \
  --keywords "AI人工智能,ChatGPT教程" \
  --target-count 20

# 查看结果并审核
npx tsx scripts/show-crawl-results.ts --task-id <task-id>

# 通过审核
npx tsx scripts/approve-all.ts --task-id <task-id>
```

#### 第二步：内容发布

支持发布到多个平台：**小红书、X (Twitter)、Instagram、Facebook、Threads、Pinterest**

**X (Twitter) 发布：**

```bash
# 添加 X 账号
npx tsx scripts/add-x-account.ts

# 发布推文
python scripts/x_publish.py \
  --text "Hello World" \
  --images img1.jpg img2.jpg \
  --auto-publish
```

**Instagram 发布：**

```bash
# 添加 Instagram 账号
npx tsx scripts/add-instagram-account.ts

# 发布图片
python scripts/instagram_publish.py \
  -u username -p password \
  -c "Hello Instagram" --image photo.jpg

# 发布多张图片 (Carousel)
python scripts/instagram_publish.py \
  -u username -p password \
  -c "My photos" --images photo1.jpg photo2.jpg photo3.jpg

# 发布 Story
python scripts/instagram_publish.py \
  -u username -p password \
  --story --image story.jpg
```

**Facebook 发布：**

```bash
# 添加 Facebook 账号（需要 Access Token）
npx tsx scripts/add-facebook-account.ts

# 获取 Access Token: https://developers.facebook.com/tools/explorer/

# 发布文本
python scripts/facebook_publish.py \
  --token YOUR_TOKEN \
  --message "Hello Facebook"

# 发布带图片
python scripts/facebook_publish.py \
  --token YOUR_TOKEN \
  --message "Hello with photo" \
  --photo photo.jpg
```

**Pinterest 发布：**

```bash
# 添加 Pinterest 账号
npx tsx scripts/add-pinterest-account.ts

# 列出 Boards
python scripts/pinterest_publish.py --token YOUR_TOKEN --list-boards

# 发布 Pin
python scripts/pinterest_publish.py \
  --token YOUR_TOKEN \
  --board-id BOARD_ID \
  --title "Pin Title" \
  --description "Pin description" \
  --link "https://example.com" \
  --image-url "https://example.com/image.jpg"
```

**Threads 发布：**

```bash
# 添加 Threads 账号
npx tsx scripts/add-threads-account.ts

# 发布文本
python scripts/threads_publish.py \
  --token YOUR_TOKEN \
  --text "Hello Threads! 🧵"

# 发布图片
python scripts/threads_publish.py \
  --token YOUR_TOKEN \
  --text "Check this out!" \
  --image-url "https://example.com/image.jpg"

# 发布 Carousel (2-10 张图片)
python scripts/threads_publish.py \
  --token YOUR_TOKEN \
  --text "Swipe through!" \
  --carousel-images \
    "https://example.com/img1.jpg" \
    "https://example.com/img2.jpg"
```

**统一调度入口（推荐）：**

```bash
# 创建发布任务
npx tsx scripts/create-publish-task.ts \
  --source-ids <note-id-1>,<note-id-2> \
  --target-platform x

# 生成内容（AI 改编）
npx tsx scripts/generate-content.ts --task-id <publish-task-id>

# 生成配图（AI 生成）
npx tsx scripts/generate-images.ts --task-id <publish-task-id>

# 执行发布
python scripts/publish-dispatch.py --task-id <TASK_ID> --execute
```

#### 第三步：配置视觉风格

```bash
# 查看所有可用风格
npx tsx scripts/configure-account-style.ts --list-styles

# 配置账号视觉风格
npx tsx scripts/configure-account-style.ts \
  --account-id <account-id> \
  --style cute \
  --layout list \
  --aspect-ratio 9:16
```

#### 第四步：数据复盘

```bash
# 抓取昨日数据
npx tsx scripts/fetch-metrics.ts --date yesterday

# 生成数据报告
npx tsx scripts/generate-report.ts --period 7d
```

---

## 🗄️ 数据库表结构

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `source_accounts` | 信息源账号（小红书等） | platform, login_status, daily_quota |
| `target_accounts` | 被运营账号（X/IG/FB等） | platform, api_config, positioning, visual_style, layout_preference |
| `crawl_tasks` | 抓取任务 | status, query_list, target_count |
| `crawl_results` | 抓取结果 | source_url, content, quality_score, curation_status |
| `publish_tasks` | 发布任务 | status, content, generated_images, scheduled_at |
| `publish_metrics_daily` | 内容每日数据 | metric_date, engagement_rate |
| `target_accounts_metrics_daily` | 账号整体每日数据 | followers_change, engagement_rate |

---

## 🔧 OpenClaw 集成

本项目作为 OpenClaw Skill 运行，支持自然语言交互：

**用户说**: "抓一批春季穿搭的语料"  
**Agent 执行**: 创建抓取任务 → 执行搜索 → 质量评估 → 返回候选列表 → 等待确认

**用户说**: "把第1和第3条发布到 Reddit，配信息图"  
**Agent 执行**: 创建发布任务 → AI 生成内容 → AI 生成配图 → 等待样稿确认 → 执行发布

---

## 📚 文档索引

| 文档 | 说明 | 适合读者 |
|------|------|----------|
| [SKILL.md](./SKILL.md) | OpenClaw 技能主文档 | OpenClaw Agent |
| [QUICKSTART.md](./QUICKSTART.md) | 10分钟快速上手指南 | 新用户 |
| [USER_WORKFLOW.md](./USER_WORKFLOW.md) | 完整操作流程手册 | 日常使用者 |
| [docs/CONSOLE.md](./docs/CONSOLE.md) | 控制台使用说明 | 控制台用户 |
| [docs/PUBLISH_DISPATCH.md](./docs/PUBLISH_DISPATCH.md) | 统一调度入口说明 | 开发者 |
| [references/database-schema.md](./references/database-schema.md) | 数据库表结构详解 | 开发者 |
| [references/detailed-workflow.md](./references/detailed-workflow.md) | 多 Agent 协作工序设计 | 开发者 |
| [references/sop-workflows.md](./references/sop-workflows.md) | 标准操作流程 | 运营人员 |

---

## 🌐 公网部署

控制台默认本地运行，也支持通过 Caddy / Nginx 反代挂到公网子路径。

### Caddy 配置示例

```caddy
your-domain.com {
    redir /contentops /contentops/ 308

    handle_path /contentops/* {
        reverse_proxy 127.0.0.1:3210
    }
}
```

### systemd 服务示例

```ini
[Unit]
Description=content-ops console
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/social-content-ops
Environment=CONTENT_OPS_CONSOLE_HOST=127.0.0.1
Environment=CONTENT_OPS_CONSOLE_PORT=3210
ExecStart=/usr/bin/node src/console-server.mjs
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
```

---

## ⚠️ 注意事项

### 小红书抓取限制

小红书网页端有严格的反爬机制：

- ✅ **搜索列表** - 可获取标题、作者、互动数据、封面图
- ❌ **详情接口** - 多数笔记返回 "笔记不可访问"，无法获取完整正文

**解决方案**: 对于无法自动获取详情的笔记，支持人工补充后导入系统。

### 账号安全

- 请妥善保管 cookies 和 API 密钥
- 建议定期更换登录凭据
- 遵守各平台的使用条款

### 控制台安全

- 当前默认账号密码适合初始部署验证，不适合长期公网裸用
- 上公网后建议尽快修改密码
- 建议后续再加一层访问限制或更强认证

---

## 📊 版本记录

### v0.3.0 (当前版本)

- 扩展 task-driven publishing 到 Threads / Facebook / Pinterest
- 给 Threads 做成第二个样板平台
- 新增本地 / 公网可用控制台
- 新增登录模块、账号详情页、任务详情页
- 新增按平台动态校验
- 支持 Caddy 子路径部署、systemd 常驻运行

### v0.2.0

- 内容运营基础数据库和脚本
- X API 发布链路
- publish-dispatch 初版

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范

1. 使用 TypeScript 编写脚本
2. 数据库变更需生成迁移文件
3. 新功能需更新 SKILL.md 文档

---

## 📄 开源协议

[MIT License](./LICENSE)

---

## 🔗 相关项目

- [OpenClaw](https://openclaw.ai) - 开源 AI Agent 框架
- [baoyu-skills](https://github.com/JimLiu/baoyu-skills) - AI 内容生成技能集
- [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) - 小红书 MCP 服务

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/cwyhkyochen-a11y">cwyhkyochen-a11y</a>
</p>
