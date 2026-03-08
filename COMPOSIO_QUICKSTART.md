# Composio 集成 - 快速开始

## 一、前置准备

### 1. 获取 Composio API Key

访问 https://platform.composio.dev/settings 获取 API Key

### 2. 设置环境变量

```bash
export COMPOSIO_API_KEY="your_api_key"
```

### 3. 确认安装

```bash
cd skills/content-ops
pip list | grep composio
# 应该看到: composio-core 0.7.21
```

## 二、快速测试

### 运行测试脚本

```bash
cd skills/content-ops
python3 quick_test_composio.py
```

**测试流程：**
1. 输入 Entity ID（如 `user_twitter_main`）
2. 选择平台（Twitter 或 Reddit）
3. 检查连接状态
4. 如果未连接，获取授权链接
5. 如果已连接，测试发布功能

## 三、使用示例

### Python 代码

```python
from src.composio_publisher import ComposioPublisher

# 初始化
publisher = ComposioPublisher()

# 1. 获取授权链接（首次使用）
url = publisher.get_authorization_url(
    entity_id="user_twitter_main",
    platform="twitter"
)
print(f"请访问: {url}")

# 2. 检查连接状态
if publisher.check_connection("user_twitter_main", "twitter"):
    print("✅ Twitter 已连接")

# 3. 发布推文
result = publisher.publish_twitter_text(
    entity_id="user_twitter_main",
    text="Hello from Composio!"
)
print(result)
```

### 命令行

```bash
# 获取授权链接
python3 src/composio_publisher.py \
    --entity-id "user_twitter_main" \
    --platform twitter \
    --authorize

# 检查连接
python3 src/composio_publisher.py \
    --entity-id "user_twitter_main" \
    --platform twitter \
    --check

# 发布内容
python3 src/composio_publisher.py \
    --entity-id "user_twitter_main" \
    --platform twitter \
    --action create_post \
    --text "Hello!"
```

## 四、数据库配置

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
    'user_twitter_main',
    'active'
);
```

### 查询 Composio 账号

```sql
SELECT id, platform, account_name, composio_user_id 
FROM target_accounts 
WHERE auth_mode = 'composio';
```

## 五、集成到现有系统

### 在 publish-dispatch.py 中使用

```python
from src.composio_publisher import ComposioPublisher

composio = ComposioPublisher()

# 读取账号信息
account = get_account_from_db(account_id)

if account['auth_mode'] == 'composio':
    # 使用 Composio 发布
    result = composio.publish_twitter_text(
        entity_id=account['composio_user_id'],
        text=content
    )
else:
    # 使用原有实现
    result = publish_via_self(account, content)
```

## 六、文件清单

### 核心文件

- `src/composio_publisher.py` - Composio 发布器（标准化版本）
- `quick_test_composio.py` - 快速测试脚本
- `docs/COMPOSIO_USAGE.md` - 详细使用文档
- `COMPOSIO_CAPABILITIES.md` - 能力报告

### 数据库

- `src/db/schema.ts` - 已添加 `auth_mode` 和 `composio_user_id` 字段
- `src/db/migrations/0003_black_gamma_corps.sql` - 迁移脚本

## 七、支持的功能

### 平台支持

- ✅ Twitter/X
- ✅ Reddit
- ⏳ Instagram（待 Composio 支持）
- ⏳ Facebook
- ⏳ Pinterest

### Twitter 功能

- ✅ 发布文本推文
- ✅ 发布 Thread
- ⏳ 上传图片/视频（需要实现）
- ⏳ 获取分析数据

### 通用功能

- ✅ OAuth 授权流程
- ✅ 连接状态检查
- ✅ 多账号管理（通过 entity_id）
- ✅ 错误处理和重试

## 八、下一步

1. **测试基础功能**
   ```bash
   python3 quick_test_composio.py
   ```

2. **添加测试账号到数据库**
   ```sql
   INSERT INTO target_accounts ...
   ```

3. **集成到 publish-dispatch.py**
   - 添加 Composio 路由逻辑
   - 支持混合模式（Composio + 自有实现）

4. **完善 Web 控制台**
   - 添加账号连接按钮
   - 显示连接状态
   - 支持重新授权

## 九、常见问题

### Q: Entity ID 是什么？

A: Entity ID 是 Composio 中的用户标识，对应你的 `account_id` 或 `composio_user_id`。建议使用有意义的命名，如 `user_twitter_main`。

### Q: 如何添加新平台？

A: 在 `src/composio_publisher.py` 中：
1. 添加到 `PLATFORM_MAP`
2. 添加到 `ACTION_MAP`
3. 实现专用方法（可选）

### Q: 如何处理多个账号？

A: 每个账号使用不同的 `entity_id`：
- `user_twitter_main`
- `user_twitter_backup`
- `team_instagram_official`

### Q: 授权链接过期了怎么办？

A: 重新运行授权命令获取新链接：
```bash
python3 src/composio_publisher.py --entity-id "xxx" --platform twitter --authorize
```

## 十、参考资料

- Composio 官方文档: https://docs.composio.dev/
- Twitter 工具包: https://docs.composio.dev/toolkits/twitter
- 详细使用文档: `docs/COMPOSIO_USAGE.md`
- 能力报告: `COMPOSIO_CAPABILITIES.md`
