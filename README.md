# Content-Ops - 多平台内容运营系统

> 基于 Composio 的统一社交媒体内容发布和管理平台

## 🌟 核心特性

- **🔐 统一授权管理** - 通过 Composio 托管 OAuth，一次授权永久有效
- **📱 多平台支持** - Twitter/X、YouTube、Reddit、Discord、Slack、Facebook、Instagram 等 10+ 平台
- **🚀 批量发布** - 一键发布到多个平台和账号
- **📊 可视化控制台** - Web 界面管理账号、查看发布记录
- **🤖 自动化工作流** - 支持定时发布、内容审核、数据分析

## 🎯 快速开始

### 1. 环境部署

```bash
# 克隆仓库
git clone https://github.com/your-org/content-ops.git
cd content-ops

# 安装依赖
npm install
pip install composio-core

# 初始化数据库
npm run db:migrate
```

### 2. 配置 Composio

#### 2.1 获取 Composio API Key

访问 [Composio 平台](https://platform.composio.dev/settings) 获取 API Key

#### 2.2 设置环境变量

```bash
export COMPOSIO_API_KEY="your_composio_api_key"
```

或创建 `.env` 文件：

```bash
echo "COMPOSIO_API_KEY=your_composio_api_key" > .env
```

### 3. 启动控制台

```bash
npm run console
```

访问 http://127.0.0.1:3210

**默认登录信息：**
- 用户名：`kyochen`
- 密码：`kyochen28`

### 4. 授权社交媒体账号

1. 登录控制台
2. 进入"账号管理"标签
3. 点击"+ 新增账号授权"
4. 选择平台（如 Twitter/X）
5. 输入 Entity ID（如 `user_twitter_main`）
6. 点击"生成授权链接"
7. 在新窗口完成 OAuth 授权
8. 完成！

### 5. 发布内容

1. 进入"发布工作台"标签
2. 左侧选择要发布的账号（可多选）
3. 右侧输入内容、上传图片
4. 点击"发布到选中账号"
5. 一键发布到所有选中平台！

## 📚 详细文档

- [快速开始指南](docs/COMPOSIO_USAGE.md)
- [Composio 集成说明](COMPOSIO_INTEGRATION_SUMMARY.md)
- [测试指南](COMPOSIO_TEST_GUIDE.md)
- [API 文档](docs/API.md)

## 🎨 功能模块

### 账号管理

- ✅ 展示所有授权账号
- ✅ 支持 Composio 和自有实现两种认证方式
- ✅ 检查连接状态
- ✅ 一键生成授权链接

### 发布记录

- ✅ 查看所有发布历史
- ✅ 成功/失败状态标识
- ✅ 查看详细信息和链接
- ✅ 支持重新发布

### 发布工作台

- ✅ 多账号批量发布
- ✅ 支持文本、图片、视频
- ✅ 跨平台统一发布
- ✅ 实时发布进度

## 🔧 支持的平台

| 平台 | 状态 | 功能 |
|------|------|------|
| Twitter/X | ✅ | 文本、图片、Thread |
| YouTube | ✅ | 视频上传、社区帖子 |
| Reddit | ✅ | 帖子、评论 |
| Discord | ✅ | 消息、嵌入 |
| Slack | ✅ | 消息、文件 |
| Facebook | ✅ | 帖子、图片 |
| Instagram | ✅ | 图片、视频 |
| Discord Bot | ✅ | 机器人消息 |
| Pinterest | ✅ | Pin、Board |
| Threads | ✅ | 帖子 |

## 🏗️ 架构设计

```
用户 → Web 控制台 → publish-dispatch.py
                          ↓
                    检查 auth_mode
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
  Composio 模式                        自有实现模式
        ↓                                   ↓
  composio_publisher.py              x_post_api.sh
        ↓                                   ↓
  Composio API                        自有 API
        ↓                                   ↓
    各平台 API ←────────────────────────────┘
```

## 📊 数据库结构

### target_accounts - 账号表

```sql
CREATE TABLE target_accounts (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    account_name TEXT NOT NULL,
    auth_mode TEXT NOT NULL DEFAULT 'self',  -- 'composio' 或 'self'
    composio_user_id TEXT,                   -- Composio Entity ID
    status TEXT NOT NULL DEFAULT 'active',
    -- ... 更多字段
);
```

### publish_tasks - 发布任务表

```sql
CREATE TABLE publish_tasks (
    id TEXT PRIMARY KEY,
    target_account_id TEXT NOT NULL,
    status TEXT NOT NULL,
    content TEXT,  -- JSON: {text, media, publish_results}
    -- ... 更多字段
);
```

## 🔐 安全性

- ✅ OAuth 由 Composio 托管，无需存储敏感凭证
- ✅ Session 8 小时自动过期
- ✅ API Key 环境变量隔离
- ✅ 数据库本地存储

## 🚀 高级用法

### 命令行发布

```bash
# 通过 Composio 发布
python3 src/composio_publisher.py \
    --entity-id "user_twitter_main" \
    --platform twitter \
    --action create_post \
    --text "Hello World!"

# 通过任务 ID 发布
python3 scripts/publish-dispatch.py \
    --task-id task_xxx \
    --execute
```

### Python API

```python
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher()

# 发布推文
result = publisher.publish_twitter_text(
    entity_id="user_twitter_main",
    text="Hello from Python!"
)

# 发布 Thread
result = publisher.publish_twitter_thread(
    entity_id="user_twitter_main",
    texts=["第一条", "第二条", "第三条"]
)
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Composio 官方文档](https://docs.composio.dev/)
- [Twitter API 文档](https://developer.twitter.com/en/docs)
- [项目主页](https://github.com/your-org/content-ops)

## 💬 支持

- 📧 Email: support@example.com
- 💬 Discord: [加入社区](https://discord.gg/xxx)
- 📖 文档: [查看文档](https://docs.example.com)

---

**使用 Composio，让多平台内容发布变得简单！** 🚀
