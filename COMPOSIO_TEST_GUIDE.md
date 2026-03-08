# Composio 集成测试指南

## 测试环境准备

### 1. 设置环境变量

```bash
export COMPOSIO_API_KEY="ak_gDqaY5Ah3lCFDs07ZpRF"
```

### 2. 启动 Web 控制台

```bash
cd skills/content-ops
npm run console
```

访问：http://127.0.0.1:3210

## 测试场景

### 场景 1：添加 Composio 测试账号

```bash
cd skills/content-ops
sqlite3 data/content-ops.db
```

```sql
INSERT INTO target_accounts (
    id,
    platform,
    account_name,
    account_id,
    homepage_url,
    status,
    auth_mode,
    composio_user_id,
    api_config,
    created_at,
    updated_at
) VALUES (
    'test_composio_twitter',
    'x',
    'Composio Test Twitter',
    NULL,
    NULL,
    'active',
    'composio',
    'pg-test-512df173-e35a-4e67-83a3-de02aa4cb706',
    '{"auth_mode":"composio","composio_user_id":"pg-test-512df173-e35a-4e67-83a3-de02aa4cb706"}',
    strftime('%s', 'now'),
    strftime('%s', 'now')
);
```

验证：
```sql
SELECT id, platform, account_name, auth_mode, composio_user_id 
FROM target_accounts 
WHERE auth_mode = 'composio';
```

### 场景 2：Web 控制台连接 Twitter

1. 在 Web 控制台登录（kyochen / kyochen28）
2. 在"代运营账号列表"中找到"Composio Test Twitter"
3. 点击账号名称打开详情
4. 在"Composio 连接管理"区域：
   - 点击"检查连接状态" → 应显示"未连接"
   - 点击"获取授权链接" → 自动打开授权页面
5. 在授权页面完成 Twitter OAuth
6. 返回控制台，再次点击"检查连接状态" → 应显示"已连接"

### 场景 3：通过 publish-dispatch.py 发布

#### 3.1 创建发布任务

```sql
INSERT INTO publish_tasks (
    id,
    task_name,
    target_account_id,
    status,
    content,
    created_at,
    updated_at
) VALUES (
    'task_composio_test_001',
    'Composio 测试发布',
    'test_composio_twitter',
    'approved',
    '{"text":"Hello from Composio via content-ops! 🚀 #test"}',
    strftime('%s', 'now'),
    strftime('%s', 'now')
);
```

#### 3.2 执行发布（Dry-run）

```bash
cd skills/content-ops
python3 scripts/publish-dispatch.py --task-id task_composio_test_001
```

**预期输出：**
```
# Using Composio for x
# Would publish via Composio:
  Entity ID: pg-test-512df173-e35a-4e67-83a3-de02aa4cb706
  Platform: x
  Text: Hello from Composio via content-ops! 🚀 #test...

Not executed. Add --execute to publish.
```

#### 3.3 执行发布（实际执行）

```bash
python3 scripts/publish-dispatch.py --task-id task_composio_test_001 --execute
```

**预期输出：**
```json
{
  "status": "published",
  "taskId": "task_composio_test_001",
  "result": {
    "platform": "x",
    "accountId": "test_composio_twitter",
    "platformPostId": "...",
    "url": "...",
    "textPreview": "Hello from Composio via content-ops! 🚀 #test",
    "raw": {...},
    "media": {...},
    "via": "composio"
  }
}
```

#### 3.4 验证结果

```sql
SELECT id, status, content 
FROM publish_tasks 
WHERE id = 'task_composio_test_001';
```

应该看到：
- `status` = 'published'
- `content` 中包含 `publish_results` 数组

### 场景 4：Web 控制台手动发布

1. 在 Web 控制台"手动提交发帖任务"区域
2. 选择"Composio Test Twitter"账号
3. 输入正文："Test from Web Console via Composio!"
4. 点击"创建发布任务"
5. 在"推文/发帖记录"中找到新任务
6. 点击"执行"按钮
7. 验证发布成功

### 场景 5：混合模式测试

添加一个自有实现的账号：

```sql
INSERT INTO target_accounts (
    id,
    platform,
    account_name,
    status,
    auth_mode,
    api_config,
    created_at,
    updated_at
) VALUES (
    'test_self_twitter',
    'x',
    'Self Implementation Twitter',
    'active',
    'self',
    '{"access_token":"test_token"}',
    strftime('%s', 'now'),
    strftime('%s', 'now')
);
```

验证两种模式共存：
```sql
SELECT id, account_name, auth_mode 
FROM target_accounts 
WHERE platform = 'x';
```

应该看到：
- `test_composio_twitter` (auth_mode='composio')
- `test_self_twitter` (auth_mode='self')

## 测试检查清单

### ✅ 数据库层
- [ ] `auth_mode` 字段已添加
- [ ] `composio_user_id` 字段已添加
- [ ] 可以插入 Composio 账号
- [ ] 可以查询 Composio 账号

### ✅ publish-dispatch.py
- [ ] 识别 `auth_mode='composio'`
- [ ] 调用 `publish_via_composio()`
- [ ] Dry-run 显示正确信息
- [ ] 实际执行成功发布
- [ ] 结果写入 `publish_results`
- [ ] 自有实现账号不受影响

### ✅ Web 控制台
- [ ] 账号列表显示 Composio 账号
- [ ] 账号详情显示"Composio 连接管理"区域
- [ ] "检查连接状态"按钮工作
- [ ] "获取授权链接"按钮工作
- [ ] 授权链接自动打开新窗口
- [ ] 手动发布任务支持 Composio 账号

### ✅ Composio 功能
- [ ] 获取授权链接成功
- [ ] 完成 OAuth 授权
- [ ] 检查连接状态正确
- [ ] 发布推文成功
- [ ] 发布结果正确返回

## 故障排查

### 问题 1：COMPOSIO_API_KEY 未设置

**症状：**
```
CONFIG ERROR: Composio initialization failed: COMPOSIO_API_KEY 未设置
```

**解决：**
```bash
export COMPOSIO_API_KEY="your_key"
```

### 问题 2：平台未连接

**症状：**
```
CONFIG ERROR: Platform x not connected for entity xxx
```

**解决：**
1. 在 Web 控制台获取授权链接
2. 完成 OAuth 授权
3. 重新执行发布

### 问题 3：composio_publisher.py 找不到

**症状：**
```
CONFIG ERROR: Composio publisher not found
```

**解决：**
```bash
# 确认文件存在
ls -la skills/content-ops/src/composio_publisher.py

# 确认 composio-core 已安装
pip list | grep composio
```

### 问题 4：Web 控制台 API 调用失败

**症状：**
控制台显示"获取失败"或"检查失败"

**解决：**
1. 检查 console-server.mjs 是否正确启动
2. 查看服务端日志
3. 确认 Python 脚本路径正确

## 清理测试数据

```sql
-- 删除测试账号
DELETE FROM target_accounts WHERE id LIKE 'test_%';

-- 删除测试任务
DELETE FROM publish_tasks WHERE id LIKE 'task_composio_test_%';
```

## 下一步

测试通过后：
1. 添加更多平台支持（Instagram、Facebook 等）
2. 完善错误处理和重试机制
3. 添加批量发布功能
4. 优化 Web 控制台 UI
