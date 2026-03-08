# Content-Ops Skill

## 概述

Content-Ops 是一个基于 Composio 的多平台内容运营系统，支持统一管理和发布内容到 Twitter/X、YouTube、Reddit、Discord、Slack、Facebook、Instagram 等 10+ 社交媒体平台。

## 核心能力

### 1. 统一账号授权管理
- 通过 Composio 托管 OAuth 流程
- 一次授权永久有效，自动刷新 token
- 支持 10+ 主流社交媒体平台
- Web 界面一键生成授权链接

### 2. 多平台批量发布
- 一次编辑，多平台同步发布
- 支持文本、图片、视频等多种内容类型
- 跨平台内容格式自动适配
- 实时发布进度和结果反馈

### 3. 可视化管理控制台
- 现代化 Web 界面
- 账号管理、发布记录、工作台三大模块
- 支持多账号选择和批量操作
- 发布历史查询和详情查看

### 4. 灵活的集成方式
- Python API 调用
- 命令行工具
- Web 控制台操作
- 支持自定义工作流

## 快速开始

### 前置要求

- Node.js 18+
- Python 3.10+
- Composio API Key

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/content-ops.git
cd content-ops

# 2. 安装依赖
npm install
pip install composio-core

# 3. 初始化数据库
npm run db:migrate

# 4. 配置 Composio
export COMPOSIO_API_KEY="your_api_key"

# 5. 启动控制台
npm run console
```

访问 http://127.0.0.1:3210 开始使用！

## 使用场景

### 场景 1：个人内容创作者

**需求：** 在多个平台同步发布内容

**方案：**
1. 在控制台授权 Twitter、YouTube、Instagram 账号
2. 在发布工作台编写内容
3. 选择所有账号，一键发布
4. 查看发布记录和数据

### 场景 2：团队协作运营

**需求：** 多人管理多个品牌账号

**方案：**
1. 为每个品牌创建独立的 Entity ID
2. 团队成员共享控制台访问
3. 使用发布记录追踪所有操作
4. 通过 API 集成到现有工作流

### 场景 3：自动化内容分发

**需求：** 定时发布和批量操作

**方案：**
1. 使用 Python API 编写自动化脚本
2. 结合 cron 实现定时发布
3. 通过数据库管理发布队列
4. 监控发布结果和异常

## 核心功能

### 账号管理

```python
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher()

# 获取授权链接
url = publisher.get_authorization_url(
    entity_id="user_twitter_main",
    platform="twitter"
)

# 检查连接状态
connected = publisher.check_connection(
    entity_id="user_twitter_main",
    platform="twitter"
)
```

### 内容发布

```python
# 发布到单个平台
result = publisher.publish_twitter_text(
    entity_id="user_twitter_main",
    text="Hello World!"
)

# 发布 Thread
result = publisher.publish_twitter_thread(
    entity_id="user_twitter_main",
    texts=["第一条", "第二条", "第三条"]
)

# 通用发布接口
result = publisher.publish(
    entity_id="user_youtube_main",
    platform="youtube",
    action="create_post",
    params={"text": "New video!"}
)
```

### 批量发布

```python
# 发布到多个账号
accounts = [
    ("user_twitter_main", "twitter"),
    ("user_facebook_main", "facebook"),
    ("user_instagram_main", "instagram"),
]

for entity_id, platform in accounts:
    try:
        result = publisher.publish(
            entity_id=entity_id,
            platform=platform,
            action="create_post",
            params={"text": content}
        )
        print(f"✅ {platform}: 发布成功")
    except Exception as e:
        print(f"❌ {platform}: {e}")
```

## 支持的平台

| 平台 | 认证方式 | 支持功能 |
|------|---------|---------|
| Twitter/X | Composio | 文本、图片、视频、Thread |
| YouTube | Composio | 视频上传、社区帖子 |
| Reddit | Composio | 帖子、评论 |
| Discord | Composio | 消息、嵌入、文件 |
| Slack | Composio | 消息、文件、频道 |
| Facebook | Composio | 帖子、图片、视频 |
| Instagram | Composio | 图片、视频、Story |
| Discord Bot | Composio | 机器人消息 |
| Pinterest | Composio | Pin、Board |
| Threads | Composio | 帖子 |

## 架构设计

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                     Web 控制台                           │
│  (账号管理 | 发布记录 | 发布工作台)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              publish-dispatch.py                         │
│         (统一发布调度器，支持混合模式)                   │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    ↓                 ↓
┌─────────┐      ┌─────────┐
│Composio │      │自有实现 │
│ 模式    │      │ 模式    │
└────┬────┘      └────┬────┘
     │                │
     ↓                ↓
┌─────────────────────────────────────────────────────────┐
│              各平台 API (Twitter, YouTube, etc.)         │
└─────────────────────────────────────────────────────────┘
```

### 数据流

```
1. 用户在控制台创建发布任务
   ↓
2. 任务写入 publish_tasks 表
   ↓
3. publish-dispatch.py 读取任务
   ↓
4. 根据 auth_mode 选择发布方式
   ↓
5. Composio 模式：调用 composio_publisher.py
   ↓
6. 通过 Composio API 发布到目标平台
   ↓
7. 结果写入 publish_tasks.content.publish_results
   ↓
8. 控制台显示发布结果
```

## 配置说明

### 环境变量

```bash
# Composio API Key（必需）
COMPOSIO_API_KEY=your_api_key

# 数据库路径（可选）
CONTENT_OPS_DB=/path/to/content-ops.db

# 控制台端口（可选）
CONTENT_OPS_CONSOLE_PORT=3210

# 控制台登录信息（可选）
CONTENT_OPS_CONSOLE_USER=kyochen
CONTENT_OPS_CONSOLE_PASSWORD=kyochen28
```

### 数据库配置

数据库使用 SQLite，自动创建在 `data/content-ops.db`。

主要表结构：
- `target_accounts` - 账号信息
- `publish_tasks` - 发布任务
- `source_accounts` - 信息源账号（可选）
- `crawl_tasks` - 抓取任务（可选）

## 最佳实践

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
```

### 3. 批量操作

发布到多个账号时，建议：
- 使用 try-except 捕获单个账号的错误
- 记录每个账号的发布结果
- 不要因为一个账号失败而中断整个流程

### 4. 连接检查

发布前先检查连接状态：
```python
if not publisher.check_connection(entity_id, platform):
    url = publisher.get_authorization_url(entity_id, platform)
    print(f"请先授权: {url}")
    return
```

## 故障排查

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

## 扩展开发

### 添加新平台

1. 在 `src/composio_publisher.py` 中添加平台映射：
```python
PLATFORM_MAP = {
    'new_platform': App.NEW_PLATFORM,
}

ACTION_MAP = {
    'new_platform': {
        'create_post': 'NEW_PLATFORM_CREATE_POST',
    },
}
```

2. 在控制台添加平台选项
3. 测试授权和发布流程

### 自定义工作流

```python
# 定时发布
import schedule

def publish_daily():
    publisher.publish_twitter_text(
        entity_id="user_twitter_main",
        text="每日一推！"
    )

schedule.every().day.at("09:00").do(publish_daily)
```

## 性能优化

- 使用连接池复用 HTTP 连接
- 批量操作时并发发布
- 缓存账号连接状态
- 定期清理过期 session

## 安全建议

- ✅ 不要在代码中硬编码 API Key
- ✅ 使用环境变量或密钥管理服务
- ✅ 定期轮换 API Key
- ✅ 限制控制台访问 IP
- ✅ 启用 HTTPS（生产环境）

## 更新日志

### v2.0.0 (2026-03-08)
- ✨ 全新的 Web 控制台设计
- ✨ 完整的 Composio 集成
- ✨ 支持 10+ 社交媒体平台
- ✨ 多账号批量发布
- ✨ Session 时效管理（8小时）

### v1.0.0
- 🎉 初始版本发布

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- 📧 Email: support@example.com
- 💬 Discord: [加入社区](https://discord.gg/xxx)
- 📖 文档: [查看文档](https://docs.example.com)
