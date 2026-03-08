# Composio 集成使用指南

## 概述

content-ops 已集成 Composio，支持通过统一接口发布到多个社交媒体平台。

## 快速开始

### 1. 设置 API Key

```bash
export COMPOSIO_API_KEY="your_api_key"
```

或在代码中：
```python
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher(api_key="your_api_key")
```

### 2. 连接平台账号

```bash
# 获取授权链接
python3 src/composio_publisher.py \
    --entity-id "user_twitter_main" \
    --platform twitter \
    --authorize
```

在浏览器中打开链接，完成 OAuth 授权。

### 3. 检查连接状态

```bash
python3 src/composio_publisher.py \
    --entity-id "user_twitter_main" \
    --platform twitter \
    --check
```

### 4. 发布内容

```bash
python3 src/composio_publisher.py \
    --entity-id "user_twitter_main" \
    --platform twitter \
    --action create_post \
    --text "Hello from Composio!"
```

## Python API

### 初始化

```python
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher()
```

### 获取授权链接

```python
url = publisher.get_authorization_url(
    entity_id="user_twitter_main",
    platform="twitter"
)
print(f"请访问: {url}")
```

### 检查连接状态

```python
if publisher.check_connection("user_twitter_main", "twitter"):
    print("Twitter 已连接")
else:
    print("Twitter 未连接")
```

### 获取已连接平台

```python
platforms = publisher.get_connected_platforms("user_twitter_main")
print(f"已连接: {platforms}")
```

### 发布内容

#### 通用接口

```python
result = publisher.publish(
    entity_id="user_twitter_main",
    platform="twitter",
    action="create_post",
    params={"text": "Hello!"}
)
```

#### Twitter 专用方法

**发布文本：**
```python
result = publisher.publish_twitter_text(
    entity_id="user_twitter_main",
    text="Hello from Composio!"
)
```

**发布 Thread：**
```python
result = publisher.publish_twitter_thread(
    entity_id="user_twitter_main",
    texts=[
        "这是第一条推文",
        "这是第二条推文",
        "这是第三条推文"
    ]
)
```

## 数据库配置

### target_accounts 表结构

```sql
CREATE TABLE target_accounts (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    account_name TEXT NOT NULL,
    
    -- Composio 相关字段
    auth_mode TEXT NOT NULL DEFAULT 'self',  -- 'self' 或 'composio'
    composio_user_id TEXT,                   -- Composio entity_id
    
    -- 其他字段...
);
```

### 添加 Composio 账号

```sql
INSERT INTO target_accounts (
    id,
    platform,
    account_name,
    auth_mode,
    composio_user_id,
    status
) VALUES (
    'account_twitter_kyo',
    'x',
    'Kyo Twitter',
    'composio',
    'user_twitter_main',  -- 这是 Composio 的 entity_id
    'active'
);
```

### 查询 Composio 账号

```sql
SELECT * FROM target_accounts 
WHERE auth_mode = 'composio';
```

## 集成到 publish-dispatch.py

### 修改发布逻辑

```python
from src.composio_publisher import ComposioPublisher

# 初始化
composio_publisher = ComposioPublisher()

def dispatch_publish(task_id: str):
    """统一发布入口"""
    
    # 从数据库读取任务和账号信息
    task = get_publish_task(task_id)
    account = get_target_account(task['target_account_id'])
    
    if account['auth_mode'] == 'composio':
        # 使用 Composio 发布
        return publish_via_composio(account, task)
    else:
        # 使用原有实现
        return publish_via_self(account, task)

def publish_via_composio(account, task):
    """通过 Composio 发布"""
    
    entity_id = account['composio_user_id']
    platform = account['platform']
    content = task['content']['text']
    
    # 检查连接
    if not composio_publisher.check_connection(entity_id, platform):
        return {
            'success': False,
            'error': f'{platform} 未连接，请先完成授权'
        }
    
    # 发布
    result = composio_publisher.publish(
        entity_id=entity_id,
        platform=platform,
        action='create_post',
        params={'text': content}
    )
    
    return result
```

## Web 控制台集成

### 添加账号连接功能

在 `console-public/index.html` 中：

```html
<button onclick="connectComposioAccount()">连接 Composio 账号</button>

<script>
async function connectComposioAccount() {
    const entityId = prompt("输入 Entity ID:");
    const platform = prompt("输入平台 (twitter/instagram/facebook):");
    
    // 调用后端 API 获取授权链接
    const response = await fetch('/api/composio/authorize', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ entity_id: entityId, platform: platform })
    });
    
    const data = await response.json();
    
    // 打开授权页面
    window.open(data.auth_url, '_blank');
    
    alert('请在新窗口完成授权');
}
</script>
```

在 `console-server.mjs` 中：

```javascript
app.post('/api/composio/authorize', async (req, res) => {
    const { entity_id, platform } = req.body;
    
    // 调用 Python 脚本
    const { execSync } = require('child_process');
    const result = execSync(
        `python3 src/composio_publisher.py --entity-id "${entity_id}" --platform "${platform}" --authorize`,
        { cwd: __dirname }
    ).toString();
    
    // 提取 URL
    const url = result.match(/https:\/\/[^\s]+/)[0];
    
    res.json({ auth_url: url });
});
```

## 支持的平台

### 当前支持

- ✅ Twitter/X
- ✅ Reddit

### 待添加

- ⏳ Instagram（需要 Composio 支持）
- ⏳ Facebook
- ⏳ Pinterest

### 添加新平台

在 `src/composio_publisher.py` 中：

```python
# 1. 添加平台映射
PLATFORM_MAP = {
    'twitter': App.TWITTER,
    'instagram': App.INSTAGRAM,  # 新增
}

# 2. 添加动作映射
ACTION_MAP = {
    'instagram': {  # 新增
        'create_post': 'INSTAGRAM_CREATE_POST',
        'upload_media': 'INSTAGRAM_UPLOAD_MEDIA',
    },
}
```

## 故障排查

### 问题：COMPOSIO_API_KEY 未设置

```bash
export COMPOSIO_API_KEY="your_key"
```

### 问题：平台未连接

```bash
# 获取授权链接
python3 src/composio_publisher.py \
    --entity-id "user_123" \
    --platform twitter \
    --authorize
```

### 问题：发布失败

1. 检查连接状态：
```bash
python3 src/composio_publisher.py \
    --entity-id "user_123" \
    --platform twitter \
    --check
```

2. 查看详细错误：
```python
try:
    result = publisher.publish(...)
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()
```

## 最佳实践

### 1. Entity ID 命名规范

建议使用有意义的命名：
- `user_twitter_main` - 主 Twitter 账号
- `user_twitter_backup` - 备用 Twitter 账号
- `team_instagram_official` - 团队官方 Instagram

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

### 3. 连接检查

发布前先检查连接：
```python
if not publisher.check_connection(entity_id, platform):
    url = publisher.get_authorization_url(entity_id, platform)
    print(f"请先授权: {url}")
    return
```

### 4. 批量发布

```python
accounts = [
    ('user_twitter_1', 'twitter'),
    ('user_twitter_2', 'twitter'),
]

for entity_id, platform in accounts:
    try:
        result = publisher.publish(
            entity_id=entity_id,
            platform=platform,
            action='create_post',
            params={'text': content}
        )
        print(f"✅ {entity_id}: 发布成功")
    except Exception as e:
        print(f"❌ {entity_id}: {e}")
```

## 参考资料

- Composio 官方文档: https://docs.composio.dev/
- Twitter 工具包: https://docs.composio.dev/toolkits/twitter
- content-ops 能力报告: `COMPOSIO_CAPABILITIES.md`
