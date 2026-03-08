# Composio 集成指南

## 一、前置准备

### 1. 安装 Composio SDK

```bash
cd skills/content-ops
pip install composio-core
```

### 2. 设置 API Key

在 Composio 平台获取 API Key：https://platform.composio.dev/settings

```bash
export COMPOSIO_API_KEY="your_api_key_here"
```

或者写入 `.env` 文件：

```bash
echo "COMPOSIO_API_KEY=your_api_key_here" >> .env
```

### 3. 配置 Twitter 凭证

你已经在 Composio 平台配置好了 Twitter 凭证，确认：
- 去 https://platform.composio.dev/auth-configs
- 确认 Twitter auth config 已创建
- 记下 auth config ID（如 `ac_xxx`）

## 二、测试连接

### 运行测试脚本

```bash
cd skills/content-ops
python3 src/composio_test.py
```

**测试内容：**
1. 验证 API Key 是否有效
2. 创建 session
3. 列出可用的 Twitter 工具
4. （可选）发送测试帖子

**预期输出：**
```
============================================================
Composio MCP 集成测试
============================================================
🔧 初始化 Composio...
📝 创建 session (user_id: test_user_kyo)...
✅ Session 创建成功
   Session ID: sess_xxx

🔗 MCP 连接信息：
   URL: https://mcp.composio.dev/...
   Headers: {...}

🔍 获取 Twitter 工具列表...
✅ 找到 80 个 Twitter 工具
   1. TWITTER_CREATE_POST
   2. TWITTER_CREATE_THREAD
   3. TWITTER_UPLOAD_MEDIA
   ...
```

## 三、数据库改造

### 添加 Composio 支持字段

```sql
-- 添加字段到 target_accounts 表
ALTER TABLE target_accounts ADD COLUMN auth_mode TEXT DEFAULT 'self';
ALTER TABLE target_accounts ADD COLUMN composio_user_id TEXT;

-- auth_mode 可选值：
-- 'self': 使用自己的 API 实现（现有方式）
-- 'composio': 使用 Composio 托管
```

### 更新现有账号

```sql
-- 标记现有账号为 self 模式
UPDATE target_accounts SET auth_mode = 'self' WHERE auth_mode IS NULL;
```

### 添加新的 Composio 账号

```sql
INSERT INTO target_accounts (
    account_id,
    platform,
    auth_mode,
    composio_user_id,
    metadata
) VALUES (
    'kyo_twitter_composio',
    'x',
    'composio',
    'kyo_twitter_main',  -- Composio 的 user_id
    '{"display_name": "Kyo Twitter (Composio)"}'
);
```

## 四、集成到发布系统

### 方式 A：在 publish-dispatch.py 中添加路由

```python
# publish-dispatch.py

from src.composio_publisher import ComposioPublisher

# 初始化 Composio 发布器
composio_publisher = ComposioPublisher()

def dispatch_publish(account_id: str, content: str, media_paths: list = None):
    """统一发布入口"""
    
    # 从数据库读取账号信息
    account = get_account_info(account_id)
    
    if account['auth_mode'] == 'composio':
        # 使用 Composio 发布
        return publish_via_composio(account, content, media_paths)
    else:
        # 使用原有实现
        return publish_via_self(account, content, media_paths)

def publish_via_composio(account, content, media_paths):
    """通过 Composio 发布"""
    
    user_id = account['composio_user_id']
    
    if media_paths:
        # 带媒体
        result = composio_publisher.publish_twitter_with_media(
            user_id=user_id,
            text=content,
            media_paths=media_paths
        )
    else:
        # 纯文本
        result = composio_publisher.publish_twitter_text(
            user_id=user_id,
            text=content
        )
    
    return result
```

### 方式 B：创建独立的 Composio 发布脚本

```bash
# 创建 composio_publish.py
python3 src/composio_publisher.py
```

## 五、Web 控制台集成

### 添加账号连接功能

在 `console-public/index.html` 中添加：

```html
<!-- 账号管理页面 -->
<button onclick="connectComposioAccount()">连接 Composio 账号</button>

<script>
async function connectComposioAccount() {
    const accountId = prompt("输入账号 ID:");
    const userId = prompt("输入 Composio User ID:");
    
    // 获取授权链接
    const response = await fetch('/api/composio/authorize', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            account_id: accountId,
            user_id: userId,
            toolkit: 'twitter'
        })
    });
    
    const data = await response.json();
    
    // 打开授权页面
    window.open(data.auth_url, '_blank');
    
    alert('请在新窗口完成授权，然后刷新页面');
}
</script>
```

### 在 console-server.mjs 中添加 API

```javascript
// console-server.mjs

import { ComposioPublisher } from './src/composio_publisher.py';

app.post('/api/composio/authorize', async (req, res) => {
    const { account_id, user_id, toolkit } = req.body;
    
    // 调用 Python 脚本获取授权链接
    const result = await execPython(`
from src.composio_publisher import ComposioPublisher
publisher = ComposioPublisher()
auth_url = publisher.get_authorization_url("${user_id}", "${toolkit}")
print(auth_url)
    `);
    
    res.json({ auth_url: result.trim() });
});
```

## 六、使用流程

### 首次连接账号

1. **在 Web 控制台点击"连接 Composio 账号"**
2. **输入账号信息**
   - Account ID: `kyo_twitter_composio`
   - Composio User ID: `kyo_twitter_main`
3. **在弹出窗口完成 Twitter OAuth 授权**
4. **授权完成后，账号即可使用**

### 发布内容

```bash
# 使用 Composio 账号发布
python3 publish-dispatch.py \
    --account kyo_twitter_composio \
    --content "Hello from Composio!" \
    --platform x
```

或在 Web 控制台选择该账号发布。

## 七、验证和调试

### 检查账号连接状态

```python
from src.composio_publisher import ComposioPublisher

publisher = ComposioPublisher()
session = publisher.get_session("kyo_twitter_main")

# 检查连接状态
# TODO: 添加检查连接状态的方法
```

### 查看发布日志

```bash
# 查看 publish_results.raw
cat data/publish_results.raw | grep composio
```

### 常见问题

**Q: 提示 "COMPOSIO_API_KEY 未设置"**
```bash
export COMPOSIO_API_KEY="your_key"
```

**Q: 提示 "User not authorized for toolkit"**
- 用户需要先完成 OAuth 授权
- 调用 `get_authorization_url()` 获取授权链接

**Q: 发布失败，提示 rate limit**
- Twitter API 有速率限制
- 检查你的 Twitter Developer 账号配额

## 八、迁移现有账号

### 从自有实现迁移到 Composio

```sql
-- 1. 更新账号模式
UPDATE target_accounts 
SET auth_mode = 'composio',
    composio_user_id = 'kyo_twitter_main'
WHERE account_id = 'kyo_twitter_old';

-- 2. 清空旧凭证（可选）
UPDATE target_accounts 
SET credentials = NULL
WHERE account_id = 'kyo_twitter_old';
```

### 回滚到自有实现

```sql
UPDATE target_accounts 
SET auth_mode = 'self'
WHERE account_id = 'kyo_twitter_composio';
```

## 九、下一步

1. **测试基础功能**
   - 文本发布
   - 图片发布
   - Thread 发布

2. **完善错误处理**
   - 添加重试机制
   - 记录详细日志

3. **扩展其他平台**
   - Instagram（如果 Composio 支持）
   - Pinterest
   - Facebook

4. **监控和优化**
   - 统计发布成功率
   - 监控 API 调用次数
   - 评估成本

## 十、参考资料

- Composio 官方文档：https://docs.composio.dev/
- Twitter 工具包：https://docs.composio.dev/toolkits/twitter
- API 参考：https://docs.composio.dev/reference
