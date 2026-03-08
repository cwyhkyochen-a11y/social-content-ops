# Content-Ops v2.0 - 多平台内容运营系统

> 基于 Composio 的统一社交媒体内容发布和管理平台

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/cwyhkyochen-a11y/social-content-ops)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🌟 核心能力

### 1. 统一账号授权管理 🔐

- **Composio OAuth 托管** - 无需管理复杂的 OAuth 流程和 token 刷新
- **一次授权永久有效** - Composio 自动处理 token 刷新和过期
- **10+ 平台支持** - Twitter/X、YouTube、Reddit、Discord、Slack、Facebook、Instagram、Pinterest、Threads、Discord Bot
- **Web 界面管理** - 可视化查看所有授权账号状态
- **一键生成授权链接** - 无需手动配置 OAuth 回调
- **连接状态检查** - 实时验证账号授权是否有效
- **混合模式支持** - 同时支持 Composio 托管和自有实现

### 2. 多平台批量发布 🚀

- **一次编辑，多平台同步** - 选择多个账号，一键发布到所有平台
- **跨平台内容适配** - 自动处理不同平台的格式要求
- **多媒体支持** - 文本、图片、视频、链接全支持
- **批量操作** - 同时发布到 Twitter、Facebook、Instagram 等多个平台
- **发布队列管理** - 支持定时发布和批量任务
- **实时进度反馈** - 查看每个平台的发布状态
- **失败重试机制** - 自动或手动重试失败的发布任务

### 3. 可视化管理控制台 📊

#### 账号管理模块
- 展示所有授权账号列表
- 显示平台、认证方式、授权状态
- 支持新增账号授权
- 检查连接状态
- 生成授权链接

#### 发布记录模块
- 查看所有发布历史
- 成功/失败状态标识
- 显示标题、平台、账号、时间
- 查看发布链接
- 查看详细信息和错误日志
- 支持重新发布

#### 发布工作台模块
- **多账号选择器** - 复选框批量选择账号
- **内容编辑器** - 标题、正文、链接输入
- **媒体上传** - 支持图片和视频
- **实时预览** - 查看选中的账号列表
- **批量发布** - 一键发布到所有选中账号
- **发布进度** - 显示成功/失败数量

### 4. 灵活的集成方式 🔧

#### Web 控制台
```bash
npm run console
# 访问 http://127.0.0.1:3210
```

#### Python API
```python
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher()
result = publisher.publish_twitter_text(
    entity_id="user_twitter_main",
    text="Hello World!"
)
```

#### 命令行工具
```bash
python3 scripts/publish-dispatch.py \
    --task-id task_xxx \
    --execute
```

### 5. 内容抓取和管理 📥

- **多平台内容抓取** - 支持从 Twitter、小红书等平台抓取内容
- **内容库管理** - 统一管理抓取的内容
- **内容审核** - 支持内容审核和筛选
- **内容转换** - 自动适配不同平台的格式要求

### 6. 数据分析和监控 📈

- **发布统计** - 查看发布成功率、失败原因
- **账号使用情况** - 统计每个账号的发布次数
- **平台分布** - 分析内容在各平台的分布
- **时间趋势** - 查看发布时间分布

### 7. 安全和权限管理 🔒

- **Session 管理** - 8 小时自动过期
- **OAuth 安全** - 由 Composio 托管，无需存储敏感凭证
- **环境变量隔离** - API Key 通过环境变量管理
- **本地数据存储** - SQLite 数据库本地存储
- **访问控制** - 支持用户登录和权限管理

## 🎯 快速开始

### 前置要求

- Node.js 18+
- Python 3.10+
- Composio 账号和 API Key

### 1. 克隆仓库

```bash
git clone https://github.com/cwyhkyochen-a11y/social-content-ops.git
cd social-content-ops
```

### 2. 安装依赖

```bash
# Node.js 依赖
npm install

# Python 依赖
pip install composio-core
```

### 3. 初始化数据库

```bash
npm run db:migrate
```

### 4. 配置 Composio

#### 获取 API Key

访问 [Composio 平台](https://platform.composio.dev/settings) 获取 API Key

#### 设置环境变量

```bash
export COMPOSIO_API_KEY="your_composio_api_key"
```

或创建 `.env` 文件：

```bash
echo "COMPOSIO_API_KEY=your_composio_api_key" > .env
```

### 5. 启动控制台

```bash
npm run console
```

访问 http://127.0.0.1:3210

**默认登录信息：**
- 用户名：`kyochen`
- 密码：`kyochen28`

### 6. 授权社交媒体账号

1. 登录控制台
2. 进入"账号管理"标签
3. 点击"+ 新增账号授权"
4. 选择平台（如 Twitter/X）
5. 输入 Entity ID（如 `user_twitter_main`）
6. 选择认证方式：Composio 托管
7. 点击"生成授权链接"
8. 在新窗口完成 OAuth 授权
9. 完成！账号已授权

### 7. 发布内容

1. 进入"发布工作台"标签
2. 左侧选择要发布的账号（可多选）
3. 右侧输入内容：
   - 标题（可选）
   - 正文
   - 链接（可选）
   - 上传图片/视频（可选）
4. 点击"发布到选中账号"
5. 查看发布进度和结果
6. 完成！内容已发布到所有选中平台

## 📚 支持的平台

| 平台 | 状态 | 支持功能 | 认证方式 |
|------|------|---------|---------|
| **Twitter/X** | ✅ | 文本、图片、视频、Thread | Composio |
| **YouTube** | ✅ | 视频上传、社区帖子、评论 | Composio |
| **Reddit** | ✅ | 帖子、评论、投票 | Composio |
| **Discord** | ✅ | 消息、嵌入、文件、频道管理 | Composio |
| **Slack** | ✅ | 消息、文件、频道、工作区 | Composio |
| **Facebook** | ✅ | 帖子、图片、视频、Page 管理 | Composio |
| **Instagram** | ✅ | 图片、视频、Story、Reels | Composio |
| **Discord Bot** | ✅ | 机器人消息、命令、事件 | Composio |
| **Pinterest** | ✅ | Pin、Board、图片 | Composio |
| **Threads** | ✅ | 帖子、回复 | Composio |

### 平台特性对比

| 功能 | Twitter | YouTube | Reddit | Discord | Slack | Facebook | Instagram |
|------|---------|---------|--------|---------|-------|----------|-----------|
| 文本发布 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 图片上传 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 视频上传 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 链接分享 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Thread/串 | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| 定时发布 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🏗️ 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户界面层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Web 控制台   │  │ Python API   │  │ 命令行工具   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                      业务逻辑层                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         publish-dispatch.py (统一调度器)              │  │
│  │  - 读取发布任务                                       │  │
│  │  - 检查 auth_mode                                     │  │
│  │  - 路由到对应的发布器                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                              │                   │
│  ┌────────┴────────┐          ┌─────────┴────────┐         │
│  │ Composio 模式   │          │ 自有实现模式     │         │
│  │ composio_       │          │ x_post_api.sh    │         │
│  │ publisher.py    │          │ 等自有脚本       │         │
│  └─────────────────┘          └──────────────────┘         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                      平台接入层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Composio API │  │ Twitter API  │  │ YouTube API  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Reddit API   │  │ Discord API  │  │ Slack API    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

```
1. 用户在控制台创建发布任务
   ↓
2. 任务写入 publish_tasks 表
   {
     id: "task_xxx",
     target_account_id: "acc_xxx",
     status: "approved",
     content: {
       text: "Hello World",
       media: ["url1", "url2"]
     }
   }
   ↓
3. publish-dispatch.py 读取任务
   ↓
4. 查询 target_accounts 表获取账号信息
   {
     id: "acc_xxx",
     platform: "twitter",
     auth_mode: "composio",
     composio_user_id: "user_twitter_main"
   }
   ↓
5. 根据 auth_mode 选择发布方式
   ├─ composio → 调用 composio_publisher.py
   └─ self → 调用自有实现脚本
   ↓
6. Composio 模式：
   - 初始化 ComposioToolSet(api_key, entity_id)
   - 调用 execute_action(TWITTER_CREATE_POST, params)
   - 返回发布结果
   ↓
7. 结果写入 publish_tasks.content.publish_results
   {
     success: true,
     url: "https://twitter.com/xxx/status/123",
     platform_post_id: "123"
   }
   ↓
8. 控制台显示发布结果
```

### 数据库设计

#### target_accounts - 账号表

```sql
CREATE TABLE target_accounts (
    id TEXT PRIMARY KEY,                    -- 账号ID
    platform TEXT NOT NULL,                 -- 平台：twitter, youtube, reddit 等
    account_name TEXT NOT NULL,             -- 账号名称
    account_id TEXT,                        -- 平台账号ID
    homepage_url TEXT,                      -- 主页链接
    
    -- 认证信息
    auth_mode TEXT NOT NULL DEFAULT 'self', -- 认证方式：composio 或 self
    composio_user_id TEXT,                  -- Composio Entity ID
    authorized_at TEXT,                     -- 授权时间
    
    -- 状态
    status TEXT NOT NULL DEFAULT 'active',  -- 状态：active, inactive
    usable INTEGER NOT NULL DEFAULT 1,      -- 是否可用：1 可用，0 不可用
    
    -- 配置
    api_config TEXT,                        -- JSON: API 配置
    platform_config TEXT,                   -- JSON: 平台特定配置
    
    -- 内容策略
    positioning TEXT,                       -- 账号定位
    target_audience TEXT,                   -- 目标受众
    content_direction TEXT,                 -- 内容方向
    
    -- 元数据
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

#### publish_tasks - 发布任务表

```sql
CREATE TABLE publish_tasks (
    id TEXT PRIMARY KEY,                    -- 任务ID
    target_account_id TEXT NOT NULL,        -- 目标账号ID
    
    -- 任务信息
    task_name TEXT,                         -- 任务名称
    title TEXT,                             -- 标题
    
    -- 状态
    status TEXT NOT NULL,                   -- 状态：approved, published, failed
    
    -- 内容
    content TEXT,                           -- JSON: {text, media, link, publish_results}
    
    -- 审核
    review_notes TEXT,                      -- 审核备注
    
    -- 时间
    created_at TEXT NOT NULL,
    published_at TEXT,
    updated_at TEXT NOT NULL
);
```

## 🔧 配置说明

### 环境变量

```bash
# Composio API Key（必需）
COMPOSIO_API_KEY=your_api_key

# 数据库路径（可选，默认：data/content-ops.db）
CONTENT_OPS_DB=/path/to/content-ops.db

# 控制台端口（可选，默认：3210）
CONTENT_OPS_CONSOLE_PORT=3210

# 控制台登录信息（可选）
CONTENT_OPS_CONSOLE_USER=kyochen
CONTENT_OPS_CONSOLE_PASSWORD=kyochen28

# Session 超时时间（可选，默认：8小时，单位：毫秒）
SESSION_TIMEOUT_MS=28800000
```

### 数据库配置

数据库使用 SQLite，默认路径：`data/content-ops.db`

主要表：
- `target_accounts` - 账号信息
- `publish_tasks` - 发布任务
- `source_accounts` - 信息源账号（可选）
- `crawl_tasks` - 抓取任务（可选）

## 💻 使用示例

### 示例 1：批量发布到多个平台

```python
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher()

# 定义要发布的账号
accounts = [
    ("user_twitter_main", "twitter"),
    ("user_facebook_page", "facebook"),
    ("user_instagram_official", "instagram"),
]

content = "🎉 新产品发布！查看详情：https://example.com"

# 批量发布
results = []
for entity_id, platform in accounts:
    try:
        result = publisher.publish(
            entity_id=entity_id,
            platform=platform,
            action="create_post",
            params={"text": content}
        )
        results.append({
            "platform": platform,
            "success": True,
            "url": result.get("url")
        })
        print(f"✅ {platform}: 发布成功")
    except Exception as e:
        results.append({
            "platform": platform,
            "success": False,
            "error": str(e)
        })
        print(f"❌ {platform}: {e}")

# 输出结果
print(f"\n发布完成：{sum(r['success'] for r in results)}/{len(results)} 成功")
```

### 示例 2：发布 Twitter Thread

```python
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher()

# 发布 Thread
thread_texts = [
    "1/ 今天分享一个关于内容运营的技巧 🧵",
    "2/ 首先，了解你的目标受众非常重要",
    "3/ 其次，保持内容的一致性和质量",
    "4/ 最后，定期分析数据并优化策略",
    "5/ 希望对大家有帮助！💪"
]

result = publisher.publish_twitter_thread(
    entity_id="user_twitter_main",
    texts=thread_texts
)

print(f"Thread 发布成功！第一条链接：{result.get('url')}")
```

### 示例 3：检查账号连接状态

```python
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher()

# 检查多个账号的连接状态
accounts = [
    ("user_twitter_main", "twitter"),
    ("user_youtube_channel", "youtube"),
    ("user_reddit_account", "reddit"),
]

for entity_id, platform in accounts:
    connected = publisher.check_connection(entity_id, platform)
    status = "✅ 已连接" if connected else "❌ 未连接"
    print(f"{platform}: {status}")
    
    if not connected:
        # 生成授权链接
        url = publisher.get_authorization_url(entity_id, platform)
        print(f"  授权链接: {url}")
```

### 示例 4：定时发布

```python
import schedule
import time
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher()

def daily_post():
    """每天早上 9 点发布内容"""
    content = "早安！新的一天开始了 ☀️"
    
    result = publisher.publish_twitter_text(
        entity_id="user_twitter_main",
        text=content
    )
    
    print(f"定时发布完成：{result.get('url')}")

# 设置定时任务
schedule.every().day.at("09:00").do(daily_post)

# 运行
while True:
    schedule.run_pending()
    time.sleep(60)
```

## 📖 详细文档

- [快速开始指南](docs/COMPOSIO_USAGE.md)
- [Composio 集成说明](COMPOSIO_INTEGRATION_SUMMARY.md)
- [测试指南](COMPOSIO_TEST_GUIDE.md)
- [平台能力说明](COMPOSIO_CAPABILITIES.md)
- [API 文档](docs/API.md)

## 🎯 最佳实践

### 1. Entity ID 命名规范

建议使用有意义的命名：
- `user_twitter_main` - 主 Twitter 账号
- `user_twitter_backup` - 备用 Twitter 账号
- `team_instagram_official` - 团队官方 Instagram
- `brand_youtube_channel` - 品牌 YouTube 频道

### 2. 错误处理

```python
try:
    result = publisher.publish(...)
    if result.get('success'):
        print("✅ 发布成功")
    else:
        print(f"❌ 发布失败: {result.get('error')}")
except Exception as e:
    print(f"❌ 异常: {e}")
    # 记录日志、发送通知等
```

### 3. 批量操作

发布到多个账号时，建议：
- 使用 try-except 捕获单个账号的错误
- 记录每个账号的发布结果
- 不要因为一个账号失败而中断整个流程
- 提供详细的日志和反馈

### 4. 连接检查

发布前先检查连接状态：
```python
if not publisher.check_connection(entity_id, platform):
    url = publisher.get_authorization_url(entity_id, platform)
    print(f"请先授权: {url}")
    return
```

### 5. 内容适配

不同平台有不同的限制：
- Twitter: 280 字符（文本）
- Instagram: 2200 字符
- Facebook: 63,206 字符
- 图片数量、视频大小等也有限制

建议在发布前进行验证。

## 🔍 故障排查

### 问题 1：COMPOSIO_API_KEY 未设置

**症状：** `ValueError: COMPOSIO_API_KEY 未设置`

**解决：**
```bash
export COMPOSIO_API_KEY="your_key"
```

### 问题 2：平台未连接

**症状：** `Platform xxx not connected`

**解决：**
1. 在控制台进入"账号管理"
2. 点击对应账号的"检查连接"
3. 如果未连接，点击"新增账号授权"生成授权链接
4. 完成 OAuth 授权

### 问题 3：发布失败

**症状：** 发布返回错误

**排查步骤：**
1. 检查连接状态
2. 查看错误信息
3. 确认内容格式符合平台要求
4. 检查 Composio API 配额
5. 查看控制台日志

### 问题 4：控制台无法访问

**症状：** 无法打开 http://127.0.0.1:3210

**解决：**
1. 检查控制台是否启动：`ps aux | grep console-server`
2. 检查端口是否被占用：`lsof -i :3210`
3. 查看启动日志
4. 尝试更换端口：`CONTENT_OPS_CONSOLE_PORT=3211 npm run console`

## 🚀 性能优化

- **连接池** - 复用 HTTP 连接
- **并发发布** - 批量操作时并发处理
- **缓存** - 缓存账号连接状态
- **定期清理** - 清理过期 session 和日志

## 🔒 安全建议

- ✅ 不要在代码中硬编码 API Key
- ✅ 使用环境变量或密钥管理服务
- ✅ 定期轮换 API Key
- ✅ 限制控制台访问 IP
- ✅ 启用 HTTPS（生产环境）
- ✅ 定期备份数据库
- ✅ 监控异常登录和操作

## 📊 更新日志

### v2.0.0 (2026-03-09)
- ✨ 全新的 Web 控制台设计
- ✨ 完整的 Composio 集成
- ✨ 支持 10+ 社交媒体平台
- ✨ 多账号批量发布
- ✨ Session 时效管理（8小时）
- 📝 完整的文档体系
- 🎨 现代化 UI 设计

### v1.0.0
- 🎉 初始版本发布

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发指南

```bash
# 克隆仓库
git clone https://github.com/cwyhkyochen-a11y/social-content-ops.git
cd social-content-ops

# 安装依赖
npm install
pip install -r requirements.txt

# 运行测试
npm test

# 启动开发服务器
npm run dev
```

## 📄 许可证

MIT License

## 🔗 相关链接

- [GitHub 仓库](https://github.com/cwyhkyochen-a11y/social-content-ops)
- [Composio 官方文档](https://docs.composio.dev/)
- [Twitter API 文档](https://developer.twitter.com/en/docs)
- [YouTube API 文档](https://developers.google.com/youtube)

## 💬 支持

- 📧 Email: support@example.com
- 💬 Discord: [加入社区](https://discord.gg/xxx)
- 📖 文档: [查看文档](https://docs.example.com)
- 🐛 Bug 报告: [GitHub Issues](https://github.com/cwyhkyochen-a11y/social-content-ops/issues)

---

**使用 Composio，让多平台内容发布变得简单！** 🚀

Made with ❤️ by Content-Ops Team
