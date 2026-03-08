# Composio 能力报告

## 一、数据库改造 ✅

已成功添加 Composio 支持字段到 `target_accounts` 表：

```sql
-- 迁移文件: src/db/migrations/0003_black_gamma_corps.sql
ALTER TABLE `target_accounts` ADD `auth_mode` text;
UPDATE `target_accounts` SET `auth_mode` = 'self' WHERE `auth_mode` IS NULL;
ALTER TABLE `target_accounts` ADD `composio_user_id` text;
```

**新增字段：**
- `auth_mode`: 认证模式（'self' 或 'composio'）
- `composio_user_id`: Composio 的用户标识

**Schema 定义：**
```typescript
// src/db/schema.ts
authMode: text('auth_mode').notNull().$default(() => 'self'),
composioUserId: text('composio_user_id'),
```

## 二、Composio SDK 安装 ✅

**版本：** `composio-core 0.7.21`

**安装命令：**
```bash
pip install composio-core
```

**依赖包：**
- paramiko (SSH 支持)
- pyyaml (配置文件)
- jsonschema (Schema 验证)
- rich (终端输出)
- sentry-sdk (错误追踪)
- websocket-client (实时通信)

## 三、Composio 核心能力

### 1. 主要类和模块

**核心类：**
- `Composio` - SDK 客户端（但没有 `create()` 方法）
- `ComposioToolSet` - 工具集管理器（主要使用这个）
- `App` - 应用枚举（包含 `App.TWITTER`）
- `Action` - 动作枚举
- `Trigger` - 触发器

**模块结构：**
```
composio/
├── Composio          # SDK 客户端
├── ComposioToolSet   # 工具集（核心）
├── App               # 应用枚举
├── Action            # 动作枚举
├── Trigger           # 触发器
├── client/           # API 客户端
├── tools/            # 工具实现
├── storage/          # 存储层
└── utils/            # 工具函数
```

### 2. ComposioToolSet 核心方法

**初始化参数：**
```python
ComposioToolSet(
    api_key: Optional[str] = None,           # API Key（必需）
    entity_id: str = 'default',              # 实体ID（用户标识）
    workspace_id: Optional[str] = None,      # 工作空间ID
    connected_account_ids: Optional[Dict] = None,  # 已连接账号
    max_retries: int = 3,                    # 重试次数
    # ... 更多参数
)
```

**关键方法：**

#### 执行动作
```python
execute_action(
    action: Union[str, Action],      # 动作名称或枚举
    params: dict,                     # 参数
    entity_id: Optional[str] = None, # 实体ID
    connected_account_id: Optional[str] = None,  # 连接账号ID
) -> Dict
```

#### 获取动作 Schema
```python
get_action_schemas(
    apps: Optional[Sequence[App]] = None,     # 应用列表
    actions: Optional[Sequence[Action]] = None,  # 动作列表
    tags: Optional[Sequence[Tag]] = None,     # 标签列表
) -> List[ActionModel]
```

#### 查找动作
```python
find_actions_by_tags(
    *apps: App,           # 应用
    tags: List[str]       # 标签
) -> List[Action]
```

#### 账号管理
```python
get_connected_account(entity_id: str, app: App)
get_connected_accounts(entity_id: str)
check_connected_account(entity_id: str, app: App)
initiate_connection(entity_id: str, app: App)
```

#### 集成管理
```python
create_integration(app: App, ...)
get_integration(integration_id: str)
get_integrations()
```

#### 触发器
```python
create_trigger_listener(...)
get_active_triggers()
delete_trigger(trigger_id: str)
```

### 3. 使用模式

**模式 A：使用 entity_id（推荐）**
```python
from composio import ComposioToolSet, App, Action

# 初始化
toolset = ComposioToolSet(
    api_key="your_api_key",
    entity_id="kyo_twitter_main"  # 对应你的 account_id
)

# 执行动作
result = toolset.execute_action(
    action="TWITTER_CREATE_POST",
    params={"text": "Hello!"},
    entity_id="kyo_twitter_main"
)
```

**模式 B：使用 connected_account_id**
```python
# 如果你已经有 connected_account_id
result = toolset.execute_action(
    action="TWITTER_CREATE_POST",
    params={"text": "Hello!"},
    connected_account_id="ca_xxx"
)
```

### 4. Twitter 支持

**确认：**
- ✅ `App.TWITTER` 存在
- ⚠️ `Action.TWITTER_*` 枚举为空（需要运行时加载）

**可用的 Twitter 动作（根据文档）：**
- `TWITTER_CREATE_POST` - 发推文
- `TWITTER_UPLOAD_MEDIA` - 上传媒体
- `TWITTER_INIT_MEDIA_UPLOAD` - 初始化媒体上传
- `TWITTER_APPEND_MEDIA_UPLOAD` - 追加媒体数据
- `TWITTER_FINALIZE_MEDIA_UPLOAD` - 完成媒体上传
- `TWITTER_ADD_POST_TO_BOOKMARKS` - 收藏
- `TWITTER_GET_POST_ANALYTICS` - 获取分析数据
- ... 共 80 个动作

### 5. 认证流程

**步骤 1：初始化连接**
```python
toolset = ComposioToolSet(api_key="your_key")

# 发起连接（获取授权链接）
connection = toolset.initiate_connection(
    entity_id="kyo_twitter_main",
    app=App.TWITTER
)

# connection 包含授权 URL
auth_url = connection.get("redirectUrl")
print(f"请访问: {auth_url}")
```

**步骤 2：用户授权**
用户在浏览器中完成 OAuth 授权。

**步骤 3：检查连接状态**
```python
account = toolset.get_connected_account(
    entity_id="kyo_twitter_main",
    app=App.TWITTER
)

if account:
    print("✅ 已连接")
else:
    print("❌ 未连接")
```

**步骤 4：执行动作**
```python
result = toolset.execute_action(
    action="TWITTER_CREATE_POST",
    params={"text": "Hello!"},
    entity_id="kyo_twitter_main"
)
```

## 四、与文档的差异

### ⚠️ 重要发现

**文档说的 API（不存在）：**
```python
# ❌ 文档中的示例（不工作）
from composio import Composio
composio = Composio()
session = composio.create(user_id="user_123")  # 没有 create() 方法
```

**实际的 API（正确）：**
```python
# ✅ 实际使用方式
from composio import ComposioToolSet
toolset = ComposioToolSet(
    api_key="your_key",
    entity_id="user_123"  # 这就是 user_id
)
```

**术语对应：**
- 文档中的 `user_id` = SDK 中的 `entity_id`
- 文档中的 `session` = SDK 中的 `ComposioToolSet` 实例
- 文档中的 `session.tools.execute()` = SDK 中的 `toolset.execute_action()`

## 五、集成建议

### 方案 A：直接使用 ComposioToolSet

```python
# src/composio_publisher.py
from composio import ComposioToolSet, App

class ComposioPublisher:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self._toolsets = {}  # 缓存 toolset
    
    def get_toolset(self, entity_id: str):
        if entity_id not in self._toolsets:
            self._toolsets[entity_id] = ComposioToolSet(
                api_key=self.api_key,
                entity_id=entity_id
            )
        return self._toolsets[entity_id]
    
    def publish_twitter_text(self, entity_id: str, text: str):
        toolset = self.get_toolset(entity_id)
        
        result = toolset.execute_action(
            action="TWITTER_CREATE_POST",
            params={"text": text},
            entity_id=entity_id
        )
        
        return result
```

### 方案 B：使用 connected_account_id

如果你在 Composio 平台已经创建了 connected account，可以直接使用：

```python
def publish_twitter_text(self, connected_account_id: str, text: str):
    toolset = ComposioToolSet(api_key=self.api_key)
    
    result = toolset.execute_action(
        action="TWITTER_CREATE_POST",
        params={"text": text},
        connected_account_id=connected_account_id
    )
    
    return result
```

## 六、下一步行动

### 1. 设置 API Key
```bash
export COMPOSIO_API_KEY="your_api_key"
```

### 2. 测试连接
```bash
cd skills/content-ops
python3 src/composio_test.py
```

### 3. 连接 Twitter 账号
```python
from composio import ComposioToolSet, App

toolset = ComposioToolSet(api_key="your_key")

# 发起连接
connection = toolset.initiate_connection(
    entity_id="kyo_twitter_main",
    app=App.TWITTER
)

print(f"请访问: {connection['redirectUrl']}")
```

### 4. 测试发布
```python
result = toolset.execute_action(
    action="TWITTER_CREATE_POST",
    params={"text": "Test from Composio!"},
    entity_id="kyo_twitter_main"
)

print(result)
```

## 七、总结

### ✅ 已完成
1. 数据库添加 `auth_mode` 和 `composio_user_id` 字段
2. 安装 `composio-core 0.7.21`
3. 探索 SDK 结构和能力

### 📋 Composio 提供的核心能力
1. **统一的工具执行接口** - `execute_action()`
2. **账号连接管理** - OAuth 流程托管
3. **80+ Twitter 动作** - 发推、上传媒体、分析等
4. **Entity 隔离** - 每个 entity_id 独立管理连接
5. **自动重试** - 内置重试机制
6. **Schema 验证** - 自动验证参数
7. **触发器支持** - 监听外部事件

### ⚠️ 注意事项
1. 文档和实际 API 有差异（用 `ComposioToolSet` 而非 `Composio.create()`）
2. 需要自己的 Twitter API 凭证（2026年2月后）
3. `entity_id` 就是文档中的 `user_id`
4. Action 枚举需要运行时加载（首次会刷新缓存）

### 🎯 推荐使用方式
使用 `entity_id` 模式，每个 `account_id` 对应一个 `entity_id`，简单直接。
