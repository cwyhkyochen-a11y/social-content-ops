---
name: content-ops
description: Social media content operations automation system with SQLite database. Manage content crawling, curation, publishing, and analytics across platforms (Xiaohongshu, Reddit, Pinterest, Discord).
---

# Content Ops System

社交媒体内容运营自动化系统，使用 **SQLite + Drizzle ORM** 存储数据，支持小红书、Reddit、Pinterest、Discord 等平台的内容抓取、策划、发布和数据分析。

---

## 📋 目录

1. [初始化部署](#一初始化部署)
2. [测试任务](#二测试任务)
3. [正式任务](#三正式任务)
4. [工作流详解](#四工作流详解)
5. [参考文档](#五参考文档)

---

## 一、初始化部署

### 1.1 基础环境

#### Node.js 依赖
```bash
cd /home/admin/.openclaw/workspace/skills/content-ops

# 安装依赖
npm install

# 生成并执行数据库迁移
npx drizzle-kit generate
npx drizzle-kit migrate
```

#### Python 依赖（可选，用于增强功能）
```bash
# 如果需要使用 xiaohongshutools skill
pip install aiohttp loguru pycryptodome getuseragent requests
```

### 1.2 MCP 服务部署

#### 小红书 MCP (xpzouying/xiaohongshu-mcp)

**下载部署：**
```bash
cd ~/.openclaw/workspace/bin

# 下载二进制文件
wget https://github.com/xpzouying/xiaohongshu-mcp/releases/download/v2026.02.28.1720-8a7fe21/xiaohongshu-mcp-linux-amd64.tar.gz
tar -xzf xiaohongshu-mcp-linux-amd64.tar.gz

# 登录（首次，扫码）
./xiaohongshu-login

# 启动服务（后台运行）
screen -dmS xhs-mcp ./xiaohongshu-mcp -headless=true
```

**服务信息：**
- 端口：`18060`
- 端点：`http://localhost:18060`
- Cookie 文件：`~/.openclaw/workspace/bin/cookies.json`

**验证服务：**
```bash
curl http://localhost:18060/api/v1/login/status
```

### 1.3 数据库初始化

**自动创建的数据表：**
| 表名 | 用途 | 核心字段 |
|------|------|----------|
| `target_accounts` | 被运营账号（Reddit等） | platform, api_config, positioning |
| `source_accounts` | 信息源账号（小红书等） | login_status, daily_quota |
| `crawl_tasks` | 抓取任务 | status, query_list, target_count |
| `crawl_results` | 抓取结果 | source_url, content, quality_score |
| `publish_tasks` | 发布任务 | status, content, scheduled_at |
| `publish_metrics_daily` | 发布内容每日数据 | metric_date, reddit_score |
| `target_accounts_metrics_daily` | 账号整体每日数据 | followers_change, engagement_rate |

**数据库位置：**
```
~/.openclaw/workspace/content-ops-workspace/data/content-ops.db
```

### 1.4 账号配置

#### 添加小红书信息源账号
```bash
npx tsx scripts/add-xhs-account.ts
```

#### 添加 Reddit 目标账号
```bash
npx tsx scripts/add-reddit-account.ts
```

---

## 二、测试任务

### 2.1 测试小红书抓取（无需登录）

```bash
# 测试搜索
curl -X POST http://localhost:18060/api/v1/feeds/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "AI人工智能", "filters": {"sort_by": "最多点赞"}}'
```

### 2.2 测试 MCP 服务状态

```bash
# 检查登录状态
curl http://localhost:18060/api/v1/login/status

# 预期返回：
# {"success": true, "data": {"is_logged_in": true, "username": "xxx"}}
```

### 2.3 测试数据库连接

```bash
# 查看数据概览
npx tsx scripts/show-overview.ts
```

### 2.4 完整测试流程

```bash
# 1. 创建测试抓取任务
npx tsx scripts/create-crawl-task.ts --keyword "AI教程" --count 5

# 2. 执行抓取
npx tsx scripts/execute-crawl.ts --task-id <task-id>

# 3. 查看结果
npx tsx scripts/show-crawl-results.ts --task-id <task-id>

# 4. 审核（测试用：全部通过）
npx tsx scripts/approve-all.ts --task-id <task-id>
```

---

## 三、正式任务

### 3.1 内容抓取 Workflow

**Step 1: 创建抓取任务**
```bash
npx tsx scripts/create-crawl-task.ts \
  --platform xiaohongshu \
  --keywords "AI人工智能,ChatGPT,AI工具" \
  --sort-by "最多点赞" \
  --target-count 50
```

**Step 2: 查看待审核列表**
```bash
npx tsx scripts/show-crawl-results.ts --task-id <task-id>
```

**Step 3: 人工审核**
```bash
# 通过指定序号
npx tsx scripts/approve-items.ts --task-id <task-id> --items 1,2,3,5

# 或全部通过
npx tsx scripts/approve-all.ts --task-id <task-id>
```

**Step 4: 补充详情（可选）**
```bash
# 查看需要补充详情的列表
npx tsx scripts/show-pending-details.ts

# 用户提供详情后导入
npx tsx scripts/import-manual-detail.ts --input /tmp/manual_details.txt
```

### 3.2 内容发布 Workflow

**Step 1: 选择语料创建发布任务**
```bash
npx tsx scripts/create-publish-task.ts \
  --source-ids <note-id-1>,<note-id-2> \
  --target-platform reddit \
  --target-account <account-id>
```

**Step 2: 生成内容（AI redesign）**
```bash
npx tsx scripts/generate-content.ts --task-id <publish-task-id>
```

**Step 3: 审核发布内容**
```bash
npx tsx scripts/review-publish-content.ts --task-id <publish-task-id>
```

**Step 4: 执行发布**
```bash
npx tsx scripts/execute-publish.ts --task-id <publish-task-id>
```

### 3.3 数据复盘 Workflow

```bash
# 抓取昨日数据
npx tsx scripts/fetch-metrics.ts --date yesterday

# 生成数据报告
npx tsx scripts/generate-report.ts --period 7d
```

---

## 四、工作流详解

### 4.1 内容抓取流程

```
用户确认主题
    ↓
创建抓取任务 (crawl_tasks)
    ↓
调用 /api/v1/feeds/search 获取列表
    ↓
保存结果到 crawl_results (标题、互动数据)
    ↓
通知人工确认
    ↓
审核通过 → 标记为可用 (curation_status='approved')
    ↓
（可选）人工补充详情正文
```

**⚠️ 抓取限制说明：**

小红书网页端有严格的反爬机制：

1. **搜索列表** ✅ 可用
   - 可获取：标题、作者、互动数据（点赞/收藏/评论数）、封面图
   - 可识别：内容类型（video/normal）

2. **详情接口** ❌ 受限
   - 多数笔记返回 "笔记不可访问" 或空数据
   - 无法获取：完整正文、评论列表
   - 原因：小红书 App-only 内容限制

### 4.2 人工辅助详情导入

当自动抓取无法获取详情时，支持人工补充：

**查看待补充列表：**
```bash
npx tsx scripts/show-pending-details.ts
```

**用户提供详情格式：**
```
详情 1
[复制粘贴第一篇笔记的正文内容]
---
详情 3
[复制粘贴第三篇笔记的正文内容]
---
```

**导入到数据库：**
```bash
npx tsx scripts/import-manual-detail.ts --input /tmp/manual_details.txt
```

数据会同时保存到：
- `crawl_results` 表的 `content` 字段
- `corpus/manual/` 目录的 JSON 文件

### 4.3 内容发布流程

```
选择可用语料 (crawl_results)
    ↓
创建发布任务 (publish_tasks) - status='draft'
    ↓
AI 基于语料生成内容 → status='pending_review'
    ↓
人工审核 → status='approved'
    ↓
定时发布 → status='scheduled' → 'published'
    ↓
每日抓取数据 (publish_metrics_daily)
```

---

## 五、参考文档

| 文档 | 说明 | 给谁看 |
|------|------|--------|
| **[使用流程手册](USER_WORKFLOW.md)** | **完整操作流程，从安装到日常运营** | 👤 用户必看 |
| [快速上手指南](QUICKSTART.md) | 10分钟快速启动 | 👤 新用户 |
| [数据库表结构](references/database-schema.md) | 完整表结构 | 🤖 开发者 |
| [详细工序设计](references/detailed-workflow.md) | 多Agent协作流程 | 🤖 开发者 |

### 常用查询

**首页看板数据：**
```typescript
const stats = await queries.getOverviewStats();
// {
//   activeAccounts: 5,
//   todayScheduledTasks: 3,
//   pendingCorpus: 20,
//   availableCorpus: 150,
//   weeklyPublished: 21
// }
```

**账号7天趋势：**
```typescript
const trend = await queries.getAccountTrend(accountId, 7);
```

**内容表现排行：**
```typescript
const topContent = await queries.getTopPerformingContent(accountId, 30, 10);
```

### 数据库备份

```bash
# 复制文件即可备份
cp ~/.openclaw/workspace/content-ops-workspace/data/content-ops.db \
   ~/.openclaw/workspace/content-ops-workspace/data/backup-$(date +%Y%m%d).db
```

### 目录结构

```
~/.openclaw/workspace/content-ops-workspace/
├── data/
│   └── content-ops.db          # SQLite 数据库文件
├── accounts/                    # Markdown 账号档案
├── strategies/                  # 运营策略文档
├── corpus/
│   ├── raw/                    # 原始抓取语料
│   ├── manual/                 # 人工导入语料
│   └── published/              # 已发布内容
└── reports/                    # 数据报告
```

---

## 快速检查清单

### 部署前检查
- [ ] Node.js 依赖安装完成 (`npm install`)
- [ ] 数据库迁移执行完成 (`npx drizzle-kit migrate`)
- [ ] 小红书 MCP 服务运行中 (`curl http://localhost:18060/api/v1/login/status`)
- [ ] Cookie 文件存在 (`~/.openclaw/workspace/bin/cookies.json`)

### 测试任务检查
- [ ] MCP 登录状态正常
- [ ] 测试搜索能返回结果
- [ ] 数据库能写入数据
- [ ] 审核流程正常

### 正式任务检查
- [ ] 源账号已添加 (source_accounts)
- [ ] 目标账号已添加 (target_accounts)
- [ ] 抓取任务创建成功
- [ ] 发布任务能正常生成内容
